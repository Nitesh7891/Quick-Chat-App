import React, { useContext } from 'react'
import assets from '../assets/assets'
import { useState } from 'react';
import { AuthContext } from '../../context/AuthContext';

const LoginPage = () => {
  const [currState,setCurrState] = useState("Sign Up");
  const[fullName,setFullName]=useState("");
  const[email,setEmail]=useState("");
  const[password,setPassword]=useState("");
  const[bio,setBio]=useState("");
  const[isDataSubmitted,setIsDataSubmitted]=useState(false);

  const {login}=useContext(AuthContext);

const OnSubmitHandler=(e)=>{
  e.preventDefault();

  if(currState==="Sign Up" && !isDataSubmitted){
    setIsDataSubmitted(true);
    return;
  }
  login(currState==="Sign Up" ? "signup" : "login",
  currState==="Sign Up" ? {fullName,email,password,bio} : {email,password}
  );
}


  return (
    <div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl'>
      {/*----left side----*/}
      <img src={assets.logo_big} className='w-[min(30vw,250px)]'  />
      {/*----right side----*/}
      <form onSubmit={OnSubmitHandler}  className="border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg" action="">
        <h2 className='font-medium text-2xl flex justify-between items-center'>
          {currState}{isDataSubmitted && <img onClick={()=>setIsDataSubmitted(false)} src={assets.arrow_icon} className='w-5 cursor-pointer'/>}
           </h2>

            {currState==="Sign Up" && !isDataSubmitted &&( <input onChange={(e)=>setFullName(e.target.value)} value={fullName} type="text" className='p-2 border border-gray-500 rounded-md focus:outline-none' placeholder='Full name' required />
      )}
     
     {!isDataSubmitted &&( 
      <>
        <input onChange={(e)=>setEmail(e.target.value)} value={email} type="email" className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500' placeholder='Email' required />
        <input onChange={(e)=>setPassword(e.target.value)} value={password} type="password" className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500' placeholder='Password' required />
     </>
    )}

     {currState==="Sign Up" && isDataSubmitted &&( <textarea rows={4} onChange={(e)=>setBio(e.target.value)} value={bio} className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500' placeholder='Provide a Bio' required />
     )}

     <button type='submit' className='py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer'>{currState==='Sign Up' ? "Create Account" : "Log In"}</button>

     <div className='flex items-center gap-2 text-sm text-gray-500'>
      <input type="checkbox" />
      <p>Agree to terms of use & Privacy Policy</p>
     </div>
 
      <div className='flex flex-col gap-2'>
        {currState==='Sign Up' ? (
          <p className='text-sm text-gray-600'>Already have an account? <span onClick={()=>{setCurrState("Log In"); setIsDataSubmitted(false); setFullName(""); setEmail(""); setPassword(""); setBio("")}} className='font-medium text-violet-500 cursor-pointer'>Log In</span></p>
        ):(
          <p className='text-sm text-gray-600'>Don't have an account? <span onClick={()=>{setCurrState("Sign Up"); setIsDataSubmitted(false); setFullName(""); setEmail(""); setPassword(""); setBio("")}} className='font-medium text-violet-500 cursor-pointer'>Click here</span></p>
        )}
      </div>
      </form>
    </div>
  )
}

export default LoginPage
