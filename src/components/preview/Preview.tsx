import { createSignal, type Accessor } from "solid-js";
import clsx from "clsx";
import { exportAsPdf } from "./exportPdf";
import PreviewControls from "./PreviewControls";
import PreviewPages from "./PreviewPages";

export default function Preview(props: { class: string; html: Accessor<string>; css: Accessor<string> }) {
    const [zoom, setZoom] = createSignal(100);
    const [pagesCount, setPagesCount] = createSignal(0);

    function handleExport() {
        exportAsPdf(props.html(), props.css());
    }

    return (
        <div class={clsx(props.class, "bg-system-primary relative flex flex-col")}>
            <div class="absolute top-0 right-0 left-0">
                <PreviewControls zoom={zoom} setZoom={setZoom} onExport={handleExport} />
            </div>
            <div class="flex-1 overflow-auto">
                <div style={{ zoom: `${zoom()}%`, height: "100%" }}>
                    <PreviewPages html={props.html()} css={props.css()} onPagesCountChange={setPagesCount} />
                </div>
            </div>
            <div class="absolute right-0 bottom-5 left-0 flex justify-center">
                <div class="text-label-secondary rounded-full bg-black/5 px-3 py-1 text-sm backdrop-blur-md">
                    1/{pagesCount()}
                </div>
            </div>
        </div>
    );
}
