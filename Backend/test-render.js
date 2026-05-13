async function checkRender() {
  try {
    const res = await fetch('https://blogapp-x0mm.onrender.com/');
    console.log("Root Status:", res.status);
    const text = await res.text();
    console.log("Root Response:", text.substring(0, 200));
  } catch (err) {
    console.error("Root Error:", err.message);
  }
  
  try {
    const res2 = await fetch('https://blogapp-x0mm.onrender.com/auth/articles');
    console.log("Articles Status:", res2.status);
    const text2 = await res2.text();
    console.log("Articles Response:", text2.substring(0, 200));
  } catch (err) {
    console.error("Articles Error:", err.message);
  }
}

checkRender();
