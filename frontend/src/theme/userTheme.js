import { createTheme } from "flowbite-react";

// Theme is intentionally scoped to UserLayout/Login so the admin UI is untouched.
export const userTheme = createTheme({
  button: {
    base: "relative inline-flex items-center justify-center rounded-xl text-center font-bold transition duration-200 focus:outline-none focus:ring-4",
    color: {
      default:
        "bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-200 dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300 dark:focus:ring-amber-900/40",
      light:
        "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 focus:ring-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-slate-800",
    },
  },
  card: {
    root: {
      base: "flex rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900",
      children: "flex h-full flex-col justify-center gap-4 p-5 sm:p-6",
      href: "transition duration-200 hover:border-slate-300 hover:shadow-md dark:hover:border-slate-700",
    },
  },
  textInput: {
    field: {
      input: {
        base: "block w-full border focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
        colors: {
          gray: "border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500 dark:focus:border-amber-500 dark:focus:ring-amber-900/40",
        },
        withAddon: { on: "rounded-r-xl", off: "rounded-xl" },
      },
    },
  },
  textarea: {
    base: "block w-full rounded-xl border text-sm focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
    colors: {
      gray: "border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500 dark:focus:border-amber-500 dark:focus:ring-amber-900/40",
    },
  },
  select: {
    field: {
      select: {
        base: "block w-full appearance-none border focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
        colors: {
          gray: "border-slate-200 bg-white text-slate-900 focus:border-slate-500 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-amber-500 dark:focus:ring-amber-900/40",
        },
        withAddon: { on: "rounded-r-xl", off: "rounded-xl" },
      },
    },
  },
  navbar: {
    root: {
      base: "bg-transparent px-0 py-0",
      rounded: { on: "rounded-none", off: "" },
      inner: { base: "mx-auto flex flex-wrap items-center justify-between gap-3" },
    },
    link: {
      base: "flex min-h-11 items-center rounded-full px-3.5 py-2 text-sm font-semibold transition-all duration-200 md:px-3.5 md:py-2",
      active: {
        on: "bg-white/90 text-slate-950 shadow-sm ring-1 ring-slate-900/5 dark:bg-white/14 dark:text-amber-300 dark:ring-white/12",
        off: "border-0 text-slate-600 hover:bg-white/70 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/8 dark:hover:text-white",
      },
    },
  },
});
