document.querySelector('button').onclick = () => {
    const user = document.querySelector('input').value;
    window.location.replace(`/chat?usr=${user}`);
}