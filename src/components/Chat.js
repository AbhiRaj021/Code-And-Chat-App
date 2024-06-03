import { useEffect, useState } from "react";
import {addDoc,collection,serverTimestamp,onSnapshot,query,where,orderBy} from "firebase/firestore";
import {db,auth} from "../firebase-config";
import "../styles/Chat.css";

export const Chat=(props)=>{
    const {room} = props;
    const [newMesssage,setNewMessage]=useState(""); //newMesssage:contain message sent by user
    const [messages,setMessages]=useState([]);

    const messagesCollectionRef = collection(db, "messages"); //messagesCollectionRef pointer is pointing to messages collection in database

    useEffect(()=>{
        const queryMessages = query(
            messagesCollectionRef,
            where("room", "==", room),
            orderBy("createdAt"),
          );
          
             //retrieve docs in which value of "room" field is equal to room received from props    //created index in firestore:index helps to get result of query faster and efficiently
        const unsubscribe=onSnapshot(queryMessages,(snapshot)=>{  //snapshot:an object that provides access to the documents that match the query
            let curmessages =[];   //array of object...object will have all fields of doc and doc id
            snapshot.forEach((doc)=>{
                curmessages.push({...doc.data(),id:doc.id});   //doc.data() returns an object containing all the fields and their corresponding values for the Firestore document represented by the doc   
            });
            setMessages(curmessages);
        });   //this function will be called automatically everytime whenever changes happens to result of the query
        return ()=>unsubscribe();   //unsubscribe function that you can use to stop listening to updates    //Whwn this component unmounted return statement is executed
    },[room])   //useEffect initially runs during the mounting stage, it will also continue to run and update the messages state whenever there are changes to the query result


    const handleSubmit = async (e) => {
        e.preventDefault(); //it prevents the form from being submitted in the default way, which typically involves navigating to a new page or triggering a full page reload
        if(newMesssage==="")
            return;

            await addDoc(messagesCollectionRef, {
                text: newMesssage,
                createdAt: serverTimestamp(),
                user: auth.currentUser.displayName,
                room: room,
                email: auth.currentUser.email,
              });              
        setNewMessage("");
    };

    return(


        <div className="chat-app">
            <div className="header">
                <p>Room: {room}</p>    
            </div>

            <div className="msg-box">
                {messages.map((message) => (
                    <div
                        className={message.email === auth.currentUser.email ? "message-curuser" : "message-other"}  //this helps to separate users message from all others present in room
                    >
                        <div className="user">{message.user}</div>
                        <div className="msg-text"><span>{message.text}</span></div>
                    </div>
                ))}
            </div>

            <div className="new-message-form">
                <form  onSubmit={handleSubmit}>
                    <input className="new-message-input" placeholder="Type your message here...." value ={newMesssage} onChange={(e)=>setNewMessage(e.target.value)}/>
                    <button type="submit" className="send-button">Send</button>     {/*After clicking send button onSubmit event of form is triggered*/}
                </form>
            </div>
        </div>
    );
}