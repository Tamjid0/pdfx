import React from 'react';

const ProjectSkeleton = () => {
    return (
        <div className="bg-[#111] border border-white/[0.05] rounded-xl p-5 flex flex-col justify-between overflow-hidden h-full min-h-[200px] animate-pulse">
            <div className="flex justify-between items-start mb-5">
                <div className="w-10 h-10 rounded-lg bg-white/5"></div>
                <div className="w-20 h-3 bg-white/5 rounded"></div>
            </div>

            <div className="space-y-3 mb-4">
                <div className="w-3/4 h-5 bg-white/5 rounded"></div>
                <div className="w-1/2 h-4 bg-white/5 rounded"></div>
            </div>

            <div className="flex items-center gap-3 mb-4">
                <div className="flex -space-x-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/5 border border-black"></div>
                    ))}
                </div>
                <div className="w-16 h-3 bg-white/5 rounded"></div>
            </div>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/[0.03]">
                <div className="space-y-1">
                    <div className="w-8 h-2 bg-white/5 rounded"></div>
                    <div className="w-12 h-3 bg-white/5 rounded"></div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/5"></div>
            </div>
        </div>
    );
};

export const ProjectSkeletonGrid = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <ProjectSkeleton key={i} />
            ))}
        </div>
    );
};

export default ProjectSkeleton;
