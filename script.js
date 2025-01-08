const BACKEND_URL = "https://selmai.pythonanywhere.com";

document.addEventListener("DOMContentLoaded", () => {
    const loadModulesButton = document.getElementById("load-modules");
    const executeModuleButton = document.getElementById("execute-module");
    const modulesList = document.getElementById("modules");
    const outputPre = document.getElementById("output");

    // Load available modules
    loadModulesButton.addEventListener("click", async () => {
        modulesList.innerHTML = ""; // Clear existing list
        outputPre.textContent = ""; // Clear previous output
        try {
            const response = await fetch(`${BACKEND_URL}/modules`);
            const modules = await response.json();
            modules.forEach((module) => {
                const listItem = document.createElement("li");
                listItem.textContent = module;
                modulesList.appendChild(listItem);
            });
        } catch (error) {
            console.error("Error fetching modules:", error);
            outputPre.textContent = `Error: ${error.message}`;
        }
    });

    // Execute selected module
    executeModuleButton.addEventListener("click", async () => {
        const moduleName = document.getElementById("module-name").value.trim();
        const argumentsInput = document.getElementById("arguments").value.trim();
        const argumentsArray = argumentsInput ? argumentsInput.split(",").map(arg => arg.trim()) : [];

        if (!moduleName) {
            outputPre.textContent = "Please enter a module name.";
            return;
        }

        try {
            const response = await fetch(`${BACKEND_URL}/execute_module`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    module_name: moduleName,
                    arguments: argumentsArray,
                }),
            });

            const result = await response.json();
            if (response.ok) {
                outputPre.textContent = JSON.stringify(result, null, 2);
            } else {
                outputPre.textContent = `Error: ${result.error}`;
            }
        } catch (error) {
            console.error("Error executing module:", error);
            outputPre.textContent = `Error: ${error.message}`;
        }
    });
});
