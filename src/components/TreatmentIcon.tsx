interface TreatmentIconProps {
  category?: string;
  className?: string;
}

// Small salon pictograms share a drawing grid and a restrained line weight.
// Keep the category label alongside the drawing; the icon is decorative.
export default function TreatmentIcon({ category = "", ...props }: TreatmentIconProps) {
  const name = category.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  let drawing;

  if (/unas|manicura|pedicura/.test(name)) {
    drawing = <><path d="M7 18V9a5 5 0 0 1 10 0v9a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3Z" /><path d="M9 12V9a3 3 0 0 1 6 0v3Z" /></>;
  } else if (/ceja/.test(name)) {
    drawing = <><path d="M3 10c5-6 11-6 18-2-6-2-12-1-18 2Z" /><path d="M5 15c3 3 9 3 12 0M8 17l-1 2m6-1v2m4-3 1 2" /></>;
  } else if (/pestana/.test(name)) {
    drawing = <><path d="M3 12c5 6 13 6 18 0M5 14l-2 3m6-1-1 4m6-4 1 4m4-6 2 3" /></>;
  } else if (/cabello|peluqueria/.test(name)) {
    drawing = <><circle cx="6" cy="17" r="3" /><circle cx="6" cy="7" r="3" /><path d="m8.5 8.5 12 11M8.5 15.5 20 4M12 12l2-2" /></>;
  } else if (/maquillaje/.test(name)) {
    drawing = <><path d="m9 12 3 3-6 6-3-3 6-6Zm0 0c-2-2-1-5 1-7l3-3 6 6-3 3c-2 2-5 3-7 1ZM11 6l6 6" /><path d="m19 16 2 2-3 3-2-2 3-3Z" /></>;
  } else if (/facial|cosmetologia|estetica/.test(name)) {
    drawing = <><path d="M6 8c0-4 3-6 6-6s6 2 6 6v5c0 5-4 8-6 9-2-1-6-4-6-9V8Z" /><path d="M8 10h2m4 0h2m-4 1-1 4h2m-3 3h4" /></>;
  } else if (/spa|masaje|ritual/.test(name)) {
    drawing = <><path d="M5 18c0-2 3-3 7-3s7 1 7 3-3 3-7 3-7-1-7-3ZM7 13c0-2 2-3 5-3s5 1 5 3" /><path d="M12 7c-3 0-4-2-4-4 3 0 4 1 4 4Zm0 0c0-3 1-5 4-5 0 3-1 5-4 5Z" /></>;
  } else {
    drawing = <><ellipse cx="12" cy="8" rx="6" ry="6" /><path d="M10 14v6a2 2 0 0 0 4 0v-6M9 8c0-2 1-3 3-3" /></>;
  }

  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>{drawing}</svg>;
}
