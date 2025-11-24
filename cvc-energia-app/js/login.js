document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const msg = document.getElementById("loginMsg");
  const container = document.querySelector(".login-container");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const correo = document.getElementById("correo").value.trim();
    const password = document.getElementById("password").value.trim();

    if (correo === "admin@cvc.com" && password === "1234") {
      msg.textContent = "Acceso correcto. Redirigiendo...";
      msg.style.color = "#2ecc71";
      setTimeout(() => {
        window.location.href = "../Registrar/index.html";
      }, 900);
    } else {
      msg.textContent = "Correo o contraseña incorrectos.";
      msg.style.color = "#c0392b";
      container.classList.add("shake");
      setTimeout(() => container.classList.remove("shake"), 600);
    }
  });
});
