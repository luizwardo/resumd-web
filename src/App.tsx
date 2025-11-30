import { createSignal, createMemo } from "solid-js";
import { makePersisted } from "@solid-primitives/storage";
import { marked } from "marked";
// Constants
import markdownTemplate from "./templates/Harvard/theme.css?raw";
import cssTemplate from "./templates/Harvard/theme.css?raw";
// Components
import Preview from "./components/preview/Preview";
import Editor from "./components/editor/Editor";
import Tabs from "./components/editor/Tabs";
// Contexts
import { ThemeProvider } from "./contexts/ThemeContext";

export default function App() {
    const [activeTab, setActiveTab] = createSignal<"markdown" | "css">("markdown");

    const [markdown, setMarkdown] = makePersisted(createSignal(markdownTemplate), { name: "resumd.markdown" });
    const [css, setCss] = makePersisted(createSignal(cssTemplate), { name: "resumd.css" });

    const html = createMemo(() => marked.parse(markdown(), { async: false, breaks: true }) as string);

    return (
        <ThemeProvider>
            <main class="bg-system-secondary flex h-dvh w-dvw">
                <div class="w-1/2 p-3 2xl:w-2/5">
                    <div class="shadow-primary bg-system-tertiary flex h-full flex-col overflow-hidden rounded-xl">
                        <Tabs values={["markdown", "css"]} active={activeTab()} onChange={setActiveTab} />
                        <Editor
                            class="flex-1"
                            activeTabId={activeTab()}
                            tabs={[
                                {
                                    id: "markdown",
                                    language: "markdown",
                                    value: markdown(),
                                    onChange: setMarkdown,
                                },
                                {
                                    id: "css",
                                    language: "css",
                                    value: css(),
                                    onChange: setCss,
                                },
                            ]}
                        />
                    </div>
                </div>
                <Preview class="flex-1" html={html} css={css} />
            </main>
        </ThemeProvider>
    );
}
