import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendApiKey = process.env.RESEND_API_KEY;

const resend = resendApiKey ? new Resend(resendApiKey) : null;

const supabaseAdmin = createClient(
  supabaseUrl || '',
  serviceRoleKey || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(req: Request) {
  try {
    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: 'SUPABASE_SERVICE_ROLE_KEY is not configured on the server' },
        { status: 500 }
      );
    }

    const { inquiryId, name, email, projectTitle } = await req.json();

    if (!inquiryId || !email || !name) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const defaultPassword = 'ClientPassword@123';
    let userId: string;

    // 1. Create Auth User via Service Role
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: defaultPassword,
      email_confirm: true,
      user_metadata: { full_name: name },
    });

    if (authError) {
      // User pehle se maujood hai toh profile fetch karein
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (!existingProfile) throw authError;
      userId = existingProfile.id;
    } else {
      userId = authUser.user.id;
      await supabaseAdmin.from('profiles').upsert({
        id: userId,
        email,
        full_name: name,
        role: 'client',
      });
    }

    // 2. Auto-create Client Project
    const finalProjectTitle = projectTitle || `Project for ${name}`;
    const { data: projectData, error: projError } = await supabaseAdmin
      .from('projects')
      .insert([
        {
          title: finalProjectTitle,
          client_id: userId,
          status: 'In Progress',
          progress: 10,
          pending_tasks: 'Project onboarding & requirement intake',
          max_revisions: 3,
          used_revisions: 0,
          client_signoff: 'Pending',
        },
      ])
      .select()
      .single();

    if (projError) throw projError;

    // 3. Mark CRM Lead as Converted
    await supabaseAdmin
      .from('inquiries')
      .update({ status: 'Converted' })
      .eq('id', inquiryId);

    // 4. Log to Studio Audit Trail
    await supabaseAdmin.from('studio_activity_logs').insert([
      {
        project_id: projectData.id,
        actor_name: 'Admin',
        action: `Converted inquiry from ${name} to Client & Launched Project #${projectData.id}`,
      },
    ]);

    // 5. Send Automated Welcome Email via Resend
    if (resend) {
      try {
        await resend.emails.send({
          from: 'Askus Studio <onboarding@resend.dev>',
          to: [email],
          subject: `🚀 Your Project Workspace is Live: ${finalProjectTitle}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
              <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Welcome to Askus Studio</h2>
              <p style="color: #475569; font-size: 14px; line-height: 1.6;">Hello ${name}, your project workspace has been launched. You can track sprint deliverables, review milestones, and download invoices directly from your client portal.</p>
              
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 18px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 8px 0; font-size: 13px; color: #334155;"><strong>Portal Link:</strong> <a href="http://localhost:3000/login" style="color: #059669; text-decoration: none;">http://localhost:3000/login</a></p>
                <p style="margin: 0 0 8px 0; font-size: 13px; color: #334155;"><strong>Login Email:</strong> ${email}</p>
                <p style="margin: 0; font-size: 13px; color: #334155;"><strong>Temporary Password:</strong> <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${defaultPassword}</code></p>
              </div>

              <div style="margin-top: 24px;">
                <a href="http://localhost:3000/login" style="display: inline-block; background: #059669; color: #ffffff; padding: 10px 22px; font-weight: bold; font-size: 13px; text-decoration: none; border-radius: 8px;">Sign In to Client Portal →</a>
              </div>
            </div>
          `,
        });
      } catch (mailError) {
        console.error('Resend delivery failed (ignoring to prevent project block):', mailError);
      }
    }

    return NextResponse.json({
      success: true,
      project: projectData,
      credentials: { email, password: defaultPassword },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}