import React, { useRef, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import InputError from "@/Components/InputError";
import TableList from "./TableList";
import { format } from "sql-formatter";
import CodeArea from "./CodeArea";
import axios from "axios";
import ResultsTable from "@/Components/ResultTable";

export default function Create({ auth, tables }) {
    const { data, setData, post, errors } = useForm({
        name: "",
        query_sql: "",
    });

    const [isVerified, setIsVerified] = useState(false);
    const [result, setResult] = useState(null);
    const [verificationError, setVerificationError] = useState(null);

    // 定義 editorRef
    const editorRef = useRef(null);

    const onInsert = (value) => {
        const currentPosition = editorRef.current.editor.getCursorPosition();
        editorRef.current.editor.session.insert(currentPosition, value);
        setData("query_sql", editorRef.current.editor.getValue());
        setIsVerified(false); // 重新編輯時重置驗證狀態
    };

    const onSubmit = (e) => {
        e.preventDefault();
        console.log("Submitting data:", data);
        post(route("query.store"), {
            onSuccess: (page) => {
                console.log("Response received:", page);
                window.location.href = route("query.index");
            },
            onError: (errors) => {
                console.error("Error occurred:", errors);
            },
        });
    };

    const verifyQuery = async () => {
        const formattedQuery = format(data.query_sql);
        setData("query_sql", formattedQuery);

        console.log("Verifying query:", formattedQuery);

        try {
            const response = await axios.post(route("query.verify"), {
                query_sql: formattedQuery,
            });
            console.log("Verification result:", response.data.result);
            setResult(response.data.result);
            setVerificationError(null);
            setIsVerified(true);
        } catch (error) {
            console.log("Verification error:", error.response.data.message);
            setVerificationError(error.response.data.message);
            setResult(null);
            setIsVerified(false);
        }
    };

    return (
        <AuthenticatedLayout
            // user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        Create New Query
                    </h2>
                </div>
            }
        >
            <Head title="Create New Query" />

            <div className="py-12">
                <div className="mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <form
                            onSubmit={onSubmit}
                            className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg"
                        >
                            <div className="mt-4 mb-2 pb-4 border-b border-gray-300">
                                <TextInput
                                    id="name"
                                    type="text"
                                    name="name"
                                    placeholder="Query Name"
                                    value={data.name}
                                    className="mt-1 block w-full"
                                    isFocused={true}
                                    onChange={(e) => {
                                        setData("name", e.target.value);
                                    }}
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>

                            <div className="h-[calc(100vh-300px)]">
                                <PanelGroup direction="horizontal">
                                    <Panel defaultSize={20} minSize={10}>
                                        <div className="h-full overflow-hidden">
                                            <TableList
                                                tables={tables}
                                                onInsert={onInsert}
                                            />
                                        </div>
                                    </Panel>
                                    <PanelResizeHandle className="w-2 bg-gray-300 hover:bg-gray-400 transition-colors" />
                                    <Panel minSize={30}>
                                        <div className="h-full">
                                            <CodeArea
                                                value={data.query_sql}
                                                onChange={(value) => {
                                                    setData("query_sql", value);
                                                    setIsVerified(false);
                                                }}
                                                editorRef={editorRef}
                                                readOnly={false}
                                            />
                                            <InputError
                                                message={errors.query_sql}
                                                className="mt-2"
                                            />
                                        </div>
                                    </Panel>
                                </PanelGroup>
                            </div>

                            <div className="mt-4 text-right">
                                <Link
                                    href={route("query.index")}
                                    className="bg-gray-100 py-1 px-3 text-gray-800 rounded shadow transition-all hover:bg-gray-200 mr-2"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="button"
                                    onClick={verifyQuery}
                                    className="bg-blue-500 py-1 px-3 text-white rounded shadow transition-all hover:bg-blue-600 mr-2"
                                >
                                    Verify
                                </button>
                                <button
                                    type="submit"
                                    className={`py-1 px-3 text-white rounded shadow transition-all ${
                                        isVerified
                                            ? "bg-emerald-500 hover:bg-emerald-600"
                                            : "bg-gray-500 cursor-not-allowed"
                                    }`}
                                    disabled={!isVerified}
                                >
                                    Create
                                </button>
                            </div>
                        </form>

                        <div className="p-4 sm:p-8 text-white">
                            {result && (
                                <ResultsTable result={result} maxRows={100} />
                            )}
                            {verificationError && (
                                <div className="text-red-500">
                                    {verificationError}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* <pre className="text-white">{JSON.stringify(tables, null, 2)}</pre> */}
        </AuthenticatedLayout>
    );
}
