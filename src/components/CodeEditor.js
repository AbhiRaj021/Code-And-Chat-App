import React, { useState, useRef, useEffect } from "react";
import "firebase/firestore";
import { useDocumentData } from "react-firebase-hooks/firestore";
import {db} from "../firebase-config";
import diff_match_patch from "diff-match-patch";  //diff-match-patch is library which 1. find differences between two pieces of text  2. make changes in one file to make it copy of second file  3.when multiple users work on same piece of text from their local system this library helps to provide merged document
import {doc, setDoc,serverTimestamp} from "firebase/firestore";


// Monaco is the embedded code editor which is integrated into other applications unlike vs code, and "@monaco-editor/react" is the library that enables us to use Monaco code editor in our applications or websites.
//{Editor} is component which adds code editor functionality in app
import {Editor} from "@monaco-editor/react";
import "../styles/CodeEditor.css";


export const CodeEditor=(props)=>
{
    const room = props.room;    //room name passed as prop
    const [language,setLanguage] = useState("c");
    const [theme,setTheme] = useState("vs-dark");

    const codeRefObj = useRef();
    const roomDocRef = doc(db, "codeEditors", room);    //reference to document with doc id=room
    const [code] = useDocumentData(roomDocRef); //[code] contains data from document room
    const [codeInput, setCodeInput] = useState("");
    const dmp = new diff_match_patch();   //creating instance of diff_match_patch class which is from library diff-match-patch


    //responsible for reflecting changes everywhere 
    useEffect(() => {
        if(!code || !code.code) return;

        const recievedCode = code.code;     //recievedCode stores code present in document:room
        if (recievedCode !== codeInput) {   //users not writing in code editor will execute if condition
        
          //patch_make:compute the differences between two pieces of text     
          //patch_list contain this list of patches, which you can later apply to codeInput to transform it into receivedCode or vice versa.
          //Each patch in the list contains information about the changes, such as additions, deletions, or modifications to the text.
          let patch_list = dmp.patch_make(codeInput, recievedCode); 
          
          //patch_apply: take a list of patches and apply them to codeInput...but codeInput is not updated...but what should be in codeInput will be stored in results[0]
          //results is array of 2 elements  //results[0]:contains last updated code     //results[1]:array of boolean values...these values corresponds to  each patch of patch_list whether applied or not
          let results = dmp.patch_apply(patch_list, codeInput);     
          setCodeInput(results[0]);  
          
        } 
    }, [code]); //this useEffect will be executed when document will be updated in firestore


    //changes happening in code editor,language, theme are updated in document side by side
    useEffect(() => { 
            const data = {code: codeInput,
                        language: language,
                        theme:theme,
                        createdAt: serverTimestamp()};
            setDoc(roomDocRef, data) 
            .then(() => { console.log("Changes in code Editor has been updated successfully in document:",room); })
            .catch(error => { console.log(error); })
    }, [codeInput,language,theme]);



    return (
        <div className="code-editor">
            <div className="lang-theme">
                <div className="lang">
                    <label>Language: </label>
                    <select onChange={(e) => setLanguage(e.target.value)}>
                        <option value="c">C</option>
                        <option value="cpp">C++</option>
                        <option value="java">Java</option>
                        <option value="python">python</option>
                        <option value="html">HTML</option>
                        <option value="css">CSS</option>
                        <option value="javascript">JavaScript</option>      
                    </select>
                </div>

                <div className="theme">
                    <label>Theme: </label>
                    <select onChange={(e) => setTheme(e.target.value)}>
                        <option value="vs-dark">vs-dark</option>
                        <option value="vs">vs</option>
                        <option value="hc-black">hc-black</option>
                        <option value="hc-light">hc-light</option>     
                    </select>
                </div>
            </div>

            <Editor
                ref={codeRefObj}
                value={codeInput}   //codeInput is displayed on code editor
                onChange={(e)=>setCodeInput(e)}   //e stores whatever typed in code editor
                height="88vh"
                width="100%"
                theme={theme}
                language={language}
            />
        </div>
    )
}