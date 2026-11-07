declare global {
  var chrome: typeof import("@wxt-dev/browser").browser;

  interface Window {
    superflex_ai_context?: import("./utils/userDataStorage").AiContext;
    jQuery?: PortalJQuery;
    $?: PortalJQuery;
    fn_SubmitStdRemarks?: (...args: unknown[]) => void;
    fn_StdGradeSchemeDetail?: (...args: unknown[]) => void;
    ftn_PrintExamRetakeRequestForm?: (...args: unknown[]) => void;
  }
}

interface PortalJQuery {
  (element: string | Element): { modal(action: string): void };
  fn: { modal?: (action: string) => void; mCustomScrollbar?: (...args: unknown[]) => unknown };
}

export {};
