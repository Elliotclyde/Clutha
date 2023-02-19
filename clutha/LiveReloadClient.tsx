import React from "react";

export function LiveReloadClient({ children }) {
  return (
    <>
      {children}
      <script
        dangerouslySetInnerHTML={{
          __html: `const source = new EventSource('/livereload')
        const reload = () => location.reload(true)
        source.onMessage = reload
        source.onerror= ()=> (source.onopen = reload)
        console.log('Clutha dev server running')`,
        }}
      ></script>
    </>
  );
}
