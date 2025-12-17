import { parseMarksData, parseAttendanceData } from "./parsers";

export const runBackgroundSync = async () => {
    try {
        
        
        
        const marksRes = await fetch("/Student/StudentMarks");
        const marksText = await marksRes.text();
        const marksDoc = new DOMParser().parseFromString(marksText, "text/html");
        
        
        const marksRoot = marksDoc.querySelector(".m-grid.m-grid--hor.m-grid--root.m-page");
        const { courses: marksCourses } = parseMarksData(marksRoot);
        
        
        if (marksCourses.length > 0) {
            checkMarksNotifications(marksCourses);
        }

        
        const attRes = await fetch("/Student/StudentAttendance");
        const attText = await attRes.text();
        const attDoc = new DOMParser().parseFromString(attText, "text/html");
        
        const attRoot = attDoc.querySelector(".m-grid.m-grid--hor.m-grid--root.m-page");
        const { courses: attCourses } = parseAttendanceData(attRoot);

        
        if (attCourses.length > 0) {
            checkAttendanceNotifications(attCourses);
        }
        
        

    } catch (e) {
        console.error("Background Sync Failed", e);
    }
};

const checkMarksNotifications = (parsedCourses) => {
     const oldSnapshot = localStorage.getItem("superflex_marks_snapshot");
     let notifications = [];
     try {
        notifications = JSON.parse(localStorage.getItem("superflex_notifications") || "[]");
     } catch(e) { notifications = []; }

     let hasChanges = false;

     if (oldSnapshot) {
         const oldCourses = JSON.parse(oldSnapshot);
         const oldMap = new Map();
         
         oldCourses.forEach(c => {
             c.sections.forEach(s => {
                 s.rows.forEach(r => {
                     const key = `${c.id}|${s.id}|${r.title}`;
                     oldMap.set(key, r);
                 });
             });
         });

         parsedCourses.forEach(c => {
             c.sections.forEach(s => {
                 s.rows.forEach(r => {
                     const key = `${c.id}|${s.id}|${r.title}`;
                     const oldRow = oldMap.get(key);
                     
                     if (!oldRow) {
                         notifications.unshift({
                             id: Date.now() + Math.random(),
                             title: "New Assessment",
                             description: `${c.title}: ${r.title} added.`,
                             time: new Date().toLocaleString(),
                             read: false,
                             type: "marks",
                             link: "/Student/StudentMarks"
                         });
                         hasChanges = true;
                     } else if (oldRow.obtained !== r.obtained || oldRow.total !== r.total) {
                          notifications.unshift({
                             id: Date.now() + Math.random(),
                             title: "Marks Updated",
                             description: `${c.title}: ${r.title} updated (${oldRow.obtained.toFixed(1)}/${oldRow.total.toFixed(1)} -> ${r.obtained.toFixed(1)}/${r.total.toFixed(1)})`,
                             time: new Date().toLocaleString(),
                             read: false,
                             type: "marks",
                             link: "/Student/StudentMarks"
                         });
                         hasChanges = true;
                     }
                 });
             });
         });
     } else {
         
         hasChanges = true; 
     }
     
     if (hasChanges) {
        
        if(notifications.length > 50) notifications = notifications.slice(0, 50);

        localStorage.setItem("superflex_notifications", JSON.stringify(notifications));
        localStorage.setItem("superflex_marks_snapshot", JSON.stringify(parsedCourses));
        window.dispatchEvent(new Event("superflex-notification-update"));
     }
};

const checkAttendanceNotifications = (parsedCourses) => {
     const oldSnapshot = localStorage.getItem("superflex_attendance_snapshot");
     let notifications = [];
     try {
        notifications = JSON.parse(localStorage.getItem("superflex_notifications") || "[]");
     } catch(e) { notifications = []; }

     let hasChanges = false;

     if (oldSnapshot) {
         const oldCourses = JSON.parse(oldSnapshot);
         const oldMap = new Map();
         
         oldCourses.forEach(c => {
            c.records.forEach(r => {
                 const key = `${c.id}|${r.date}|${r.time}`;
                 oldMap.set(key, r);
            });
         });
         
         parsedCourses.forEach(c => {
            c.records.forEach(r => {
                 const key = `${c.id}|${r.date}|${r.time}`;
                 const oldRow = oldMap.get(key);
                 
                 if (!oldRow) {
                     notifications.unshift({
                         id: Date.now() + Math.random(),
                         title: "New Attendance",
                         description: `${c.title}: ${r.status} on ${r.date}`,
                         time: new Date().toLocaleString(),
                         read: false,
                         type: "attendance",
                         link: "/Student/StudentAttendance"
                     });
                     hasChanges = true;
                 } else if (oldRow.status !== r.status) {
                      notifications.unshift({
                         id: Date.now() + Math.random(),
                         title: "Attendance Updated",
                         description: `${c.title}: ${r.date} changed from ${oldRow.status} to ${r.status}`,
                         time: new Date().toLocaleString(),
                         read: false,
                         type: "attendance",
                         link: "/Student/StudentAttendance"
                     });
                     hasChanges = true;
                 }
            });
         });
     } else {
         hasChanges = true;
     }
     
     if (hasChanges) {
        
        if(notifications.length > 50) notifications = notifications.slice(0, 50);

        localStorage.setItem("superflex_notifications", JSON.stringify(notifications));
        localStorage.setItem("superflex_attendance_snapshot", JSON.stringify(parsedCourses));
        window.dispatchEvent(new Event("superflex-notification-update"));
     }
};
