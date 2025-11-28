import { createSignal, createMemo } from "solid-js";
import { marked } from "marked";
// Constants
import { TEMPLATE_1 } from "./components/editor/default";
// Components
import Preview from "./components/preview/Preview";
import Editor from "./components/editor/Editor";
import Tabs from "./components/editor/Tabs";

export default function App() {
    const [markdown, setMarkdown] = createSignal(TEMPLATE_1.markdown);
    const [css, _] = createSignal(TEMPLATE_1.css);

    const html = createMemo(() => marked.parse(markdown(), { async: false, breaks: true }) as string);

    return (
        <main class="flex h-dvh w-dvw">
            <div class="w-[calc(50%+1rem)] p-3">
                <div class="shadow-primary flex h-full flex-col overflow-hidden rounded-xl">
                    <Tabs />
                    <Editor class="flex-1" initialValue={markdown()} onValueChange={setMarkdown} />
                </div>
            </div>
            {/* <div class="bg-separator h-dvh w-px" /> */}
            <Preview class="flex-1" html={html} css={css} />
        </main>
    );
}
