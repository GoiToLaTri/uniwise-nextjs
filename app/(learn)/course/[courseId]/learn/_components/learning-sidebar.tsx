"use client";

import { CheckCircle, PlayCircle, FileText } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface LearningSidebarProps {
  sections: any[];
  activeLessonId?: string;
  sidebarOpen: boolean;
  onCloseSidebar: () => void;
  onLessonSelect: (lessonId: string) => void;
}

export function LearningSidebar({
  sections,
  activeLessonId,
  sidebarOpen,
  onCloseSidebar,
  onLessonSelect
}: LearningSidebarProps) {
  // Mở tất cả các section mặc định bằng defaultValue của Accordion
  const defaultExpanded = sections.map(s => s.id);

  return (
    <div 
      className={`absolute lg:fixed right-0 top-16 bottom-0 w-full lg:w-[350px] bg-slate-50 border-l border-slate-200 transition-transform duration-300 ease-in-out z-20 ${
        sidebarOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-white shrink-0 flex justify-between items-center">
          <h3 className="font-black text-slate-800">Nội dung khóa học</h3>
          <button className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-full" onClick={onCloseSidebar}>
            ✕
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
          <Accordion type="multiple" defaultValue={defaultExpanded} className="w-full">
            {sections.map((section, sIdx) => (
              <AccordionItem value={section.id} key={section.id} className="border-b border-slate-200 bg-white">
                <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-slate-50 text-left cursor-pointer">
                  <div className="pr-4 w-full">
                    <h4 className="font-bold text-slate-800 text-sm leading-snug">Phần {sIdx + 1}: {section.title}</h4>
                    <span className="text-xs text-slate-500 mt-1 block font-normal">
                      0 / {section.lessons?.length || 0} bài học | 10 min
                    </span>
                  </div>
                </AccordionTrigger>
                
                <AccordionContent className="pb-0 bg-slate-50/50">
                  <div className="flex flex-col">
                    {section.lessons?.map((lesson: any, lIdx: number) => {
                      const isActive = activeLessonId === lesson.id;
                      const isCompleted = lesson.isCompleted;
                      
                      return (
                        <div 
                          key={lesson.id}
                          onClick={() => onLessonSelect(lesson.id)}
                          className={`p-3 pl-4 pr-3 flex items-start gap-3 cursor-pointer transition-colors ${
                            isActive ? 'bg-indigo-50/50 pointer-events-none' : 'hover:bg-slate-100/80'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {isCompleted ? (
                              <CheckCircle className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-slate-300 bg-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold leading-tight ${isActive ? 'text-indigo-700' : 'text-slate-700'}`}>
                              {lIdx + 1}. {lesson.title}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                              {lesson.lessonType === "VIDEO" ? <PlayCircle className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                              <span>05:30</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
