export {};

const form: FormData = new FormData();
const response = await fetch("http://localhost:8000/upload", {
    method: "POST",
    body: form,
});

const data = await response.json();

console.log(data);