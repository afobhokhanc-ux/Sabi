/* Sabi backend (Supabase). With no project details in js/config.js, API.enabled is false and the app runs as a demo. */
const API=(function(){
  const c=window.SABI_CONFIG||{},lib=window.supabase;
  const configured=!!(c.supabaseUrl&&c.supabaseAnonKey);
  let sb=null;
  if(configured&&lib&&lib.createClient){try{sb=lib.createClient(c.supabaseUrl,c.supabaseAnonKey);}catch(e){sb=null;}}
  if(configured&&!sb&&window.console)console.warn('Sabi: Supabase is configured but its library did not load.');

  function fail(msg,field){const e=new Error(msg);e.field=field||'a-pw';return e;}
  function friendly(err){
    const m=String((err&&err.message)||err||'').toLowerCase(),code=err&&err.code,st=err&&err.status;
    if(code==='email_not_confirmed'||m.indexOf('email not confirmed')>-1)return fail('Confirm your email first. Open the link we sent you, then sign in.','a-email');
    if(code==='invalid_credentials'||m.indexOf('invalid login')>-1)return fail('That email and password do not match.','a-pw');
    if(code==='user_already_exists'||m.indexOf('already registered')>-1)return fail('An account with this email already exists. Sign in instead.','a-email');
    if(code==='weak_password'||m.indexOf('password should')>-1)return fail('Choose a stronger password, at least 6 characters.','a-pw');
    if(code==='over_email_send_rate_limit'||code==='over_request_rate_limit'||st===429||m.indexOf('rate limit')>-1)return fail('Too many attempts. Wait a few minutes and try again.','a-email');
    if(m.indexOf('failed to fetch')>-1||m.indexOf('network')>-1)return fail('Could not reach the server. Check your connection and try again.','a-email');
    return fail('Something went wrong. Please try again.','a-email');
  }
  async function profileOf(user){
    const r=await sb.from('profiles').select('role,full_name').eq('id',user.id).single();
    if(r.error||!r.data)throw r.error||new Error('no profile');
    return {email:user.email,role:r.data.role,name:r.data.full_name};
  }
  return {
    enabled:!!sb,
    failed:configured&&!sb,
    async signUp(email,password,name,role){
      let r;
      try{
        const redirect=/^https?:/.test(location.protocol)?location.origin+location.pathname:undefined;
        r=await sb.auth.signUp({email:email,password:password,options:{data:{role:role,full_name:name},emailRedirectTo:redirect}});
      }catch(e){throw friendly(e);}
      if(r.error)throw friendly(r.error);
      if(!r.data||!r.data.session)return {confirm:true};
      try{return await profileOf(r.data.user);}catch(e){throw friendly(e);}
    },
    async signIn(email,password){
      let r;
      try{r=await sb.auth.signInWithPassword({email:email,password:password});}catch(e){throw friendly(e);}
      if(r.error)throw friendly(r.error);
      try{return await profileOf(r.data.user);}catch(e){throw friendly(e);}
    },
    async signOut(){try{await sb.auth.signOut();}catch(e){}},
    /* Returns the signed-in user's profile, or null. Never waits more than 2.5 seconds. */
    async restore(){
      const run=(async()=>{
        const r=await sb.auth.getSession();
        const u=r&&r.data&&r.data.session&&r.data.session.user;
        return u?await profileOf(u):null;
      })();
      const stop=new Promise(res=>setTimeout(()=>res(null),2500));
      try{return await Promise.race([run,stop]);}catch(e){return null;}
    }
  };
})();
