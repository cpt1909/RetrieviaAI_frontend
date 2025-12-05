"use client";
import { useState } from "react";

export default function Ask() {

    const [errorCode, setErrorCode] = useState<number | null>(null);
    const errorMessage: Record<number, string> = {
        400: "Bad Request",
        422: "No file selected",
        413: "File size exceeds the limit",
        415: "Unsupported file type",
        500: "Internal Server Error",
        503: "Service Unavailable",
        550: "The file either is corrupted or has no readable text."
    }


    const [showUploadSection, setShowUploadSection] = useState<boolean>(true);
    const [file, setFile] = useState<File | null>();
    const maxFileSize: number = 10 * 1024 * 1024;

    async function handleUpload(){
        if (!file){
            setErrorCode(400);
            return;
        };

        try{
            const form: FormData = new FormData();
            form.append("file", file);

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
                method: "POST",
                body: form,
            });

            const data = await res.json();
            if(res.ok){
                setFileUId(data.uid);
                alert("File uploaded successfully !!");
                setShowUploadSection(false);
                setShowAskSection(true);
            }else{
                setErrorCode(res.status);
            };
        }catch(e){
            setErrorCode(503);
        }
    }

    const [fileUId, setFileUId] = useState<string>("");
    const [showAskSection, setShowAskSection] = useState<boolean>(false);
    const [query, setQuery] = useState<string>("");

    async function handleAsk(){
        if (!query){
            setErrorCode(400);
            return;
        };

        try{

            const form: FormData = new FormData();
            form.append("query", query);
            setQuery("");
            form.append("uid", fileUId);
            setChatHistory(prev => [...prev, {role: "You", content: query}]);

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/query`, {
                method: "POST",
                body: form,
            });

            const data = await res.json();
            if(res.ok){
                setChatHistory(prev => [...prev, {role: "Bot", content: data.reply}]);
            }else{
                setErrorCode(res.status);
            };
        }catch(e){
            setErrorCode(503);
        }
    }

    const [chatHistory, setChatHistory] = useState<{role: string, content: string}[]>([]);

    return (
        <div>

        {errorCode && (
        <div className="fixed top-0 left-0 right-0 z-50 w-full overflow-x-hidden overflow-y-auto md:inset-0 h-modal md:h-full flex flex-col items-center justify-center">
            <div className="border-2 rounded-2xl p-3 flex flex-col items-center justify-center">
                <h3>Error Code: {errorCode}</h3>
                <h4>{errorMessage[errorCode]}</h4>
                <button
                    onClick={() => {
                        setErrorCode(null);
                        if ([413, 415, 550].includes(errorCode)){
                            setFile(null);
                        }
                    }}
                >Close</button>
            </div>
        </div>
        )}

        {showUploadSection && (
        <div>
            <label
                htmlFor="fileInput"
                className="block h-50 w-40 border-2 border-dashed border-gray-300 p-2 rounded"
            >
                Select a file
                {file ? (
                    <div>
                        <p>{file.name}</p>
                    </div>
                ) : ""}
            </label>
            <input
                className="hidden"
                id="fileInput"
                name="fileInput"
                type="file"
                accept=".pdf, .txt, .docx"
                multiple
                onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length === 1) {

                        if(files[0].size > maxFileSize){
                            setErrorCode(413);
                            return;
                        }
                        
                        const fileExtension: string = files[0].name.split(".").pop()?.toLowerCase() ?? "";
                        const acceptedFileExtensions: string[] = ["pdf", "docx", "txt"];

                        if(!acceptedFileExtensions.includes(fileExtension)){
                            setErrorCode(415);
                            return;
                        }
                        setFile(files[0]);
                    }
                }}
            />

            <button
                type="submit"
                onClick={() => {
                    handleUpload();
                }}
            >Submit</button>

        </div>
        )}

        {chatHistory.length > 0 && (
        <div>
            {chatHistory.map((message, index) => (
                <div key={index}>
                    <p>{message.role}: {message.content}</p>
                </div>
            ))}
        </div>
        )}

        {showAskSection && (
        <div>
            
            <textarea
                placeholder="Ask your question here..."
                className="query h-32 w-3/4 border-2 border-gray-300 rounded-md p-3 text-wrap resize-none overflow-y-auto"
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                }}
            />
            <button
                type="submit"
                onClick={() => {
                    handleAsk();
                }}
            >Submit</button>

            {fileUId && (
                <div>
                    <p>File UId: {fileUId}</p>
                    <p>File Name: {file?.name}</p>
                </div>
            )}
        </div>
        )}
        
        </div>
    );
}