"use client";

import type { ReactNode } from "react";

/* 
  Discipline OS - Avaken Executive Redesign
  Component Styles Update
*/

export function Card({
  title,
  subtitle,
  children,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`group relative isolate rounded-3xl border border-emerald-500/20 bg-[#0B131D]/60 backdrop-blur-lg bg-clip-padding px-6 py-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_40px_rgba(16,185,129,0.15)] transition-all duration-300 ${className}`}
    >
      {title ? (
        <header className="mb-4">
          <h2 className="text-sm font-semibold tracking-wider text-emerald-100/90 group-hover:text-emerald-300 transition-colors duration-300">{title}</h2>
          {subtitle ? <p className="mt-1.5 text-xs text-slate-400/80 group-hover:text-slate-300/90 transition-colors duration-300">{subtitle}</p> : null}
        </header>
      ) : null}
      <div className="pointer-events-none">{children}</div>
    </section>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-3 mt-8 text-xs font-bold uppercase tracking-widest text-emerald-400/70 first:mt-0">
      {children}
    </h2>
  );
}

/* 
  Enhanced Button Component 
  (Adding since it's commonly used with cards)
*/
export function Button({
  children,
  variant = "default",
  size = "default",
  className = "",
  asChild = false,
  ...props
}: {
  children: ReactNode;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  asChild?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  // Variant configurations
  const variantConfig = {
    default: "bg-emerald-600 text-emerald-50 hover:bg-emerald-700",
    outline: "border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10",
    secondary: "bg-slate-600/40 text-slate-200 hover:bg-slate-600/50",
    ghost: "hover:bg-emerald-500/10",
    link: "text-emerald-300 underline-offset-4 hover:underline hover:text-emerald-200",
    destructive: "bg-red-600 text-red-50 hover:bg-red-700",
  };

  // Size configurations
  const sizeConfig = {
    default: "h-10 px-4 py-2 text-sm",
    sm: "h-9 rounded-md px-3 text-xs",
    lg: "h-11 rounded-md px-8 text-base",
    icon: "h-10 w-10",
  };

  const Comp = asChild ? "span" : "button";

  return (
    <Comp
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variantConfig[variant]} ${sizeConfig[size]} ${className}`}
      {...props}
    >
      {children}
    </Comp>
  );
}

export const KIND_STYLE: Record<string, string> = {
  college: "border-slate-600/40 bg-slate-500/10 text-slate-300",
  lab: "border-orange-500/30 bg-orange-500/10 text-orange-200",
  deep: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  skill: "border-sky-500/30 bg-sky-500/10 text-sky-200",
  project: "border-violet-500/30 bg-violet-500/10 text-violet-200",
  gym: "border-red-500/30 bg-red-500/10 text-red-200",
  rest: "border-teal-500/20 bg-teal-500/5 text-teal-200/80",
  review: "border-yellow-500/30 bg-yellow-500/10 text-yellow-100",
};

/* 
  Input Component (commonly needed)
*/
export function Input({
  className = "",
  type = "text",
  ...props
}: {
  className?: string;
  type?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}

/* 
  Label Component 
*/
export function Label({
  className = "",
  ...props
}: {
  className?: string;
} & React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={`text-sm font-medium leading-none text-foreground ${className}`}
      {...props}
    >
      {props.children}
    </label>
  );
}
