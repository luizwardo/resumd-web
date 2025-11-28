import { createEffect, onMount } from "solid-js";

export default function PreviewPages(props: { html: string; css: string }) {
    let iframeRef: HTMLIFrameElement | undefined;

    // We need to load the PagedJS library (not polyfill) to have manual control.
    // We'll use the CDN version for now as per plan.
    const pagedJsUrl = "https://unpkg.com/pagedjs/dist/paged.js";

    onMount(() => {
        const iframe = iframeRef;
        if (!iframe) return;

        // Initialize the iframe with the basic structure and the PagedJS library
        iframe.srcdoc = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>PagedJS Preview</title>
    <style>
      /* Base styles for the preview container */
      body { margin: 0; padding: 0; }
      
      /* Hide the preview while it's rendering */
      .preview-hidden {
        position: absolute;
        top: 0;
        left: 0;
        visibility: hidden;
        /* Move it out of view to avoid scrollbar flickering during render */
        transform: translateX(-10000px); 
      }
      
      .preview-visible {
        position: relative;
        visibility: visible;
        transform: none;
      }

      /* PagedJS default styles */
      .pagedjs_pages {
         width: 100%;
         display: flex;
         flex-direction: column;
         align-items: center;
         margin: 4rem 0 5px 0;
      }
      .pagedjs_page {
        margin: 5px auto;
        background: white;
        box-shadow: 0px 0px 0px 1px rgba(0, 0, 0, 0.06), 0 0 20px -1px rgba(0, 0, 0, 0.08);
      }
    </style>
    
    <!-- Placeholder for user CSS (removed as we pass it dynamically) -->
    
    <script src="${pagedJsUrl}"></script>
    
    <script>
      let currentRenderId = 0;
      let isRendering = false;
      let queuedRender = null;
      let lastInsertedStyles = [];

      // The main render function called from the parent
      window.renderPreview = async (html, css) => {
          // If we are already rendering, queue this request
          if (isRendering) {
              queuedRender = { html, css };
              return;
          }

          isRendering = true;
          const renderId = ++currentRenderId;
          
          try {
              // 1. Prepare styles
              // We pass the CSS as an "inline" stylesheet to PagedJS.
              // This ensures PagedJS parses @page rules using its Polisher.
              // We use a dummy URL or the current location as the key for the object format.
              const cssContent = '@page { margin: 0.4in; } ' + css;
              const stylesheets = [{ [window.location.href]: cssContent }];

              // 2. Create a new container for this render
              const root = document.body;
              const container = document.createElement('div');
              container.classList.add('preview-hidden');
              // We need to append it to the body so PagedJS can calculate layout
              root.appendChild(container);

              // 3. Run PagedJS
              if (window.Paged && window.Paged.Previewer) {
                  const previewer = new window.Paged.Previewer();
                  
                  // We pass the stylesheets explicitly.
                  // PagedJS will parse them with Polisher and insert transformed styles into <head>.
                  await previewer.preview(html, stylesheets, container);
                  
                  // 4. If this is still the latest render, show it
                  if (renderId === currentRenderId) {
                      // Remove all other children (previous renders)
                      Array.from(root.children).forEach(child => {
                          if (child !== container && child.tagName === 'DIV') {
                              child.remove();
                          }
                      });
                      
                      container.classList.remove('preview-hidden');
                      container.classList.add('preview-visible');
                      
                      // Cleanup styles from the PREVIOUS successful render
                      if (lastInsertedStyles && lastInsertedStyles.length > 0) {
                          lastInsertedStyles.forEach(style => {
                              if (style.parentNode) style.remove();
                          });
                      }
                      
                      // Save the styles from THIS render to be cleaned up next time
                      // previewer.polisher.inserted contains the <style> elements added to head
                      lastInsertedStyles = previewer.polisher.inserted;
                  } else {
                      // This render is stale, discard it
                      container.remove();
                      
                      // Also remove the styles this stale render added!
                      if (previewer.polisher.inserted) {
                          previewer.polisher.inserted.forEach(style => {
                              if (style.parentNode) style.remove();
                          });
                      }
                  }
              }
          } catch (err) {
              console.error("PagedJS render error:", err);
          } finally {
              isRendering = false;
              // If there's a queued render, run it now
              if (queuedRender) {
                  const { html, css } = queuedRender;
                  queuedRender = null;
                  window.renderPreview(html, css);
              }
          }
      };
    </script>
  </head>
  <body>
  </body>
</html>
        `;
    });

    createEffect(() => {
        const html = props.html;
        const css = props.css;
        const iframe = iframeRef;

        if (!iframe) return;

        // We need to wait for the iframe to load initially
        const triggerRender = () => {
            if (iframe.contentWindow && (iframe.contentWindow as any).renderPreview) {
                (iframe.contentWindow as any).renderPreview(html, css);
            } else {
                // Retry shortly if not ready (e.g. script loading)
                setTimeout(triggerRender, 100);
            }
        };

        triggerRender();
    });

    return (
        <iframe
            ref={iframeRef}
            style={{
                width: "100%",
                height: "100%",
                border: "none",
            }}
        />
    );
}
