class ContainerWindow {
    constructor (name = "", width = "100px", height = "100px", className = "window resizable") {
        this.element = document.createElement("div");
        this.element.style.width = width;
        this.element.style.height = height;
        this.element.className = className;
        
    }
}