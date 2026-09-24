'use client'
import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { supabase } from '@/lib/supabase';

const COLUMNS = ['To Do', 'In Progress', 'Under Review', 'Done'];

export default function ProjectKanbanBoard({ projectId }: { projectId: number | string }) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [addingToCol, setAddingToCol] = useState<string | null>(null);

  const fetchTasks = async () => {
    const { data } = await supabase
      .from('project_tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('position', { ascending: true });
    if (data) setTasks(data);
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const sourceCol = source.droppableId;
    const destCol = destination.droppableId;

    const updatedTasks = Array.from(tasks);
    const movedTaskIndex = updatedTasks.findIndex((t) => String(t.id) === draggableId);
    if (movedTaskIndex === -1) return;

    const [movedTask] = updatedTasks.splice(movedTaskIndex, 1);
    movedTask.status = destCol;
    movedTask.is_completed = destCol === 'Done';

    // Insert at destination
    const destTasks = updatedTasks.filter((t) => t.status === destCol);
    destTasks.splice(destination.index, 0, movedTask);

    setTasks([...updatedTasks.filter((t) => t.status !== destCol), ...destTasks]);

    // Update in Supabase
    await supabase
      .from('project_tasks')
      .update({ status: destCol, is_completed: destCol === 'Done', position: destination.index })
      .eq('id', draggableId);
  };

  const handleCreateTask = async (col: string) => {
    if (!newTaskTitle.trim()) return;
    const { data, error } = await supabase
      .from('project_tasks')
      .insert([
        {
          project_id: projectId,
          task_title: newTaskTitle,
          status: col,
          is_completed: col === 'Done',
          position: tasks.filter((t) => t.status === col).length,
        },
      ])
      .select()
      .single();

    if (!error && data) {
      setTasks([...tasks, data]);
      setNewTaskTitle('');
      setAddingToCol(null);
    }
  };

  return (
    <div className="space-y-4 pt-2">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => (t.status || 'To Do') === col);

            return (
              <div key={col} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between min-h-[300px]">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2">
                    <span className="text-xs font-bold text-slate-700">{col}</span>
                    <span className="text-[10px] font-mono font-bold bg-white text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                      {colTasks.length}
                    </span>
                  </div>

                  <Droppable droppableId={col}>
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2 min-h-[160px]">
                        {colTasks.map((t, index) => (
                          <Draggable key={String(t.id)} draggableId={String(t.id)} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`p-2.5 rounded-lg border text-xs bg-white transition-all shadow-2xs ${
                                  snapshot.isDragging ? 'border-emerald-500 shadow-md ring-2 ring-emerald-100' : 'border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                <p className={`text-slate-800 font-medium ${t.is_completed ? 'line-through text-slate-400' : ''}`}>
                                  {t.task_title || t.title}
                                </p>
                                <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                                  <span>#{t.id}</span>
                                  {t.assigned_to && <span>Lead assigned</span>}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>

                <div className="pt-2 border-t border-slate-200 mt-2">
                  {addingToCol === col ? (
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        placeholder="Task name..."
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        className="w-full text-xs bg-white border border-slate-200 rounded-lg p-1.5 focus:outline-none focus:border-emerald-600"
                        autoFocus
                      />
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleCreateTask(col)}
                          className="flex-1 text-[10px] font-bold bg-emerald-600 text-white rounded p-1"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => { setAddingToCol(null); setNewTaskTitle(''); }}
                          className="flex-1 text-[10px] font-semibold bg-slate-200 text-slate-700 rounded p-1"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setAddingToCol(col); setNewTaskTitle(''); }}
                      className="w-full text-left text-[11px] font-medium text-slate-500 hover:text-slate-900 py-1 hover:bg-white rounded px-1.5 transition-colors"
                    >
                      + Add task
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}