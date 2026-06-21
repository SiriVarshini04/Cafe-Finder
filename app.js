function handleSearch(){
    const category = document.getElementById("category").value;
    const radius = document.getElementById("radius").value;
    const place = document.getElementById("location").value;

    if(!place || !radius){
        alert("Please enter location and radius");
        return;
    }
    const url = `results.html?category=${category}&radius=${radius}&location=${encodeURIComponent(place)}`;
    window.location.href = url;
}

const btn = document.querySelector("#fetchbtn");
btn.addEventListener("click", handleSearch);

const inputs = document.querySelectorAll("input");
inputs.forEach(input => {
    input.addEventListener("keydown", (e) => {
        if(e.key === "Enter"){
            handleSearch();
        }
    });
});