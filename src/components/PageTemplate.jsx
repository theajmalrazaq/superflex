import React, { useEffect } from 'react';
import NavBar from './NavBar';

function PageTemplate({ children, title, pageClass = '' }) {
    useEffect(() => {
        document.querySelectorAll("header").forEach(element => {
            element.classList.add('!hidden');
        });

        document.querySelectorAll(".m-aside-left.m-aside-left--skin-dark").forEach(element => {
            element.classList.add('!hidden');
        });

        document.querySelectorAll(".m-aside-left--fixed .m-body").forEach(element => {
            element.classList.add('!p-0');
        });

        document.querySelectorAll(".m-grid__item.m-grid__item--fluid.m-grid.m-grid--ver-desktop.m-grid--desktop.m-body").forEach(element => {
            element.classList.add('!bg-dark');
        });

        document.querySelector(".m-subheader")?.classList.add('!hidden');
    }, []);

    return (
        <div className={`flex gap-5 items-start p-2.5 justify-between w-full max-w-[1200px] m-auto text-white ${pageClass}`}>


            <div className="flex-1 flex flex-col h-screen overflow-y-auto pr-4">
                <div className="bg-secondary p-8 rounded-lg mt-5 w-full">
                    <h1 className="text-2xl font-bold mb-6 border-b border-white/10 pb-4">
                        <span className="text-primary">{title}</span>
                    </h1>

                    {children}
                </div>
            </div>
        </div>
    );
}

export default PageTemplate;
