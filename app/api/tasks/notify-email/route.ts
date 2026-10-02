import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { employeeEmail, employeeName, taskTitle, projectName, priority, dueDate } = await req.json();

    if (!employeeEmail) {
      return NextResponse.json({ error: 'Employee email is required' }, { status: 400 });
    }

    // Email send via Verified Custom Domain
    const { data, error } = await resend.emails.send({
      from: 'AskUs Studio <notifications@askusstudio.in>',
      to: employeeEmail,
      subject: `📌 New Task Assigned: ${taskTitle} (${priority || 'Medium'})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px; background-color: #ffffff;">
          <h2 style="color: #0f172a; margin-bottom: 8px;">New Task Assignment</h2>
          <p style="color: #475569; font-size: 14px;">Hi <strong>${employeeName || 'Team Member'}</strong>,</p>
          <p style="color: #475569; font-size: 14px;">A new task has been assigned to you in the AskUs Studio workspace.</p>
          
          <div style="background-color: #f8fafc; border-left: 4px solid #10b981; padding: 12px 16px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 4px 0; font-size: 14px;"><strong>📋 Task:</strong> ${taskTitle}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>📁 Project:</strong> ${projectName || 'Active Sprint'}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>⚡ Priority:</strong> <span style="color: #d97706; font-weight: bold;">${priority || 'Medium'}</span></p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>📅 Due Date:</strong> ${dueDate || 'Not specified'}</p>
          </div>

          <p style="margin-top: 24px;">
            <a href="https://askusstudio.in/dashboard/employee" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 13px; display: inline-block;">
              Open Employee Workspace →
            </a>
          </p>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin-top: 30px;" />
          <p style="font-size: 11px; color: #94a3b8;">AskUs Studio Console • Automated Notification</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend delivery error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Email send error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}