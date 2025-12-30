function App() {

  const login = async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const res = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      document.getElementById("result").innerText =
        "Welcome " + data.user.name + " (" + data.user.role + ")";
    } else {
      document.getElementById("result").innerText = "Login Failed";
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Login</h2>

      <input id="email" placeholder="Email" /><br /><br />
      <input id="password" type="password" placeholder="Password" /><br /><br />

      <button id="loginBtn" onClick={login}>Login</button>

      <h3 id="result"></h3>
    </div>
  );
}

export default App;
