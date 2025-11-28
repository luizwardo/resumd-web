import { createSignal, type Accessor } from "solid-js";
import clsx from "clsx";
import { exportAsPdf } from "./exportPdf";
import ZoomControl from "./ZoomControl";
import PreviewPages from "./PreviewPages";
import { IoDownloadOutline } from "solid-icons/io";

export default function Preview(props: { class: string; html: Accessor<string>; css: Accessor<string> }) {
    const [zoom, setZoom] = createSignal(100);

    function handleExport() {
        exportAsPdf(props.html(), props.css());
    }

    return (
        <div class={clsx(props.class, "bg-system-primary relative flex flex-col")}>
            <div class="flex-1 overflow-auto">
                <div style={{ zoom: `${zoom()}%`, height: "100%" }}>
                    <PreviewPages html={props.html()} css={props.css()} />
                </div>
            </div>

            <div class="absolute top-3 right-0 left-0 flex justify-between px-3.5">
                <ZoomControl zoom={zoom} setZoom={setZoom} />

                <button
                    class="bg-blue outline-blue focus-active:outline-2 flex h-9 cursor-pointer items-center rounded-full pl-3.5 font-medium tracking-tight text-white outline-offset-2 backdrop-blur-md active:outline-2"
                    onClick={handleExport}
                    title="Export PDF"
                >
                    <p>Export as PDF</p>
                    <IoDownloadOutline class="mr-3 ml-2 size-5" />
                </button>
            </div>
        </div>
    );
}
