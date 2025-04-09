import React, { useEffect, useState } from 'react';
import PageLayout from '../layouts/PageLayout';

function CourseFeedbackPage() {
    const [elemContent, setElemContent] = useState(null);

    useEffect(() => {
        const targetElement = document.querySelector(".m-grid.m-grid--hor.m-grid--root.m-page");

        if (targetElement) {
            setElemContent(targetElement.innerHTML);
            targetElement.remove();
        }
    }, []);

    return (
        <PageLayout currentPage={window.location.pathname}>
            {elemContent && (
                <div className="m-grid m-grid--hor m-grid--root m-page"
                    dangerouslySetInnerHTML={{ __html: elemContent }} />
            )}
        </PageLayout>
    );
}

export default CourseFeedbackPage;
