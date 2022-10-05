import {IRequest} from "../interfaces";


const preMinifiedJs = `
function getFormUrlString() {
    return document.getElementById('url').value;
}

function isValidHttpUrl(urlString) {
    let url;
    try {
        url = new URL(urlString);
    } catch {
        return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
}

function showCopyToClipBtn(show) {
    let element = document.getElementById("copy-to-clip-btn");
    let hidden = element.getAttribute("hidden");
    
    if (show && hidden)
       element.removeAttribute("hidden");
    else 
       element.setAttribute("hidden", "hidden");
}

function setResultsText(text) {
    const element = document.getElementById('shortened-url')                
    element.innerHTML = text 
}

function showResultsText(show) {
    const element = document.getElementById('shortened-url')
    let hidden = element.getAttribute("hidden");
    
    if (show && hidden)
       element.removeAttribute("hidden");
    else{
        element.setAttribute("hidden", "hidden");
        element.innerHTML = ''
    }
}

function setErrorText(text) {
    console.log('setErrorText() -> ' + text)
    const element = document.getElementById('form-validation-error')                
    element.innerHTML = text 
}

function showErrorText(show) {
    const element = document.getElementById('form-validation-error')
    let hidden = element.getAttribute("hidden");
    
    if (show && hidden)
       element.removeAttribute("hidden");
    else {
        element.setAttribute("hidden", "hidden");
        element.innerHTML = ''
    }
}

function showResultDisclaimerText(show) {
    const element = document.getElementById('shortened-url-disclaimer')
    let hidden = element.getAttribute("hidden");
    
    if (show && hidden)
       element.removeAttribute("hidden");
    else {
        element.setAttribute("hidden", "hidden");
    }
}

function showOutput(show) {
    const element = document.getElementById("results-div");
    
    if (show) {
        element.removeAttribute("hidden");
        element.classList.add('uk-animation-slide-top-small')
        setTimeout(() => {
            // UIKit apparently needs some time before removing for it to allow re-adding
            element.classList.remove('uk-animation-slide-top-small') 
        }, 100)
    } else {
        element.setAttribute("hidden", "hidden");
    }
}

function validateForm() {
    console.log('validateForm()')
    let success = true             
    if (!isValidHttpUrl(getFormUrlString())){
        setErrorText('Url must be in format of http(s)://example.com')
        success = false
    }
    console.log('validateForm() success -> ' + success)
    return success
} 

function resetOutputIfRequired() {
    showCopyToClipBtn(false)
    setResultsText('')
    showResultsText(false)
    setErrorText('')
    showErrorText(false)
    showResultDisclaimerText(false)
    showOutput(false)
}

function toggleFormProgress(){
    let element = document.getElementById("form-progress-indicator")
    let hidden = element.getAttribute("hidden");
    
    if (hidden) {
       element.removeAttribute("hidden");
    } else {
       element.setAttribute("hidden", "hidden");
    }
}

async function handleSubmit(event) {
    event.preventDefault(); // do not remove event.*
    
    resetOutputIfRequired() // close and reset results if called more than once
    
    let success = false              
    
    toggleFormProgress() // start loading icon
    if (validateForm()){
        const data = {url: getFormUrlString()}
        
        console.log('data -> ' + JSON.stringify(data))
        
        let response = await fetch('/api/generate-link', {method: 'POST', body: JSON.stringify(data)})
        if (response.ok){
            console.log('response.ok')
            const resData = await response.json()
            
            setResultsText(resData.url)
            showResultsText(true)
            showResultDisclaimerText(true)
            showCopyToClipBtn(true)
            success = true
        }
        else {
            console.log('! response.ok')
            setErrorText('An unexpected error occured')
        }
    }
    
    if (!success)
        showErrorText(true)
    
    console.log('success -> ' + success)
    
    showOutput(true)
    toggleFormProgress() // stop loading icon
}

var form = document.getElementById('submit-form');
if (form.attachEvent) {
    form.attachEvent("submit", handleSubmit);
} else {
    form.addEventListener("submit", handleSubmit);
}

var clipboard = new ClipboardJS('.btn');
clipboard.on('success', function(e) {
    const element = document.getElementById('shortened-url')
    element.classList.add('uk-animation-shake') // shake
    
    setTimeout(() => {
        // UIKit appearently needs some time before removing for it to allow re-adding
        element.classList.remove('uk-animation-shake') 
    }, 100)

    e.clearSelection();
});

clipboard.on('error', function(e) {
    console.error('Action:', e.action);
    console.error('Trigger:', e.trigger);
});
`


export const html = `
<!DOCTYPE html>
<html>
    <head>
        <title>Link Shortener</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="data:image/x-icon;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQEAYAAABPYyMiAAAABmJLR0T///////8JWPfcAAAACXBIWXMAAABIAAAASABGyWs+AAAAF0lEQVRIx2NgGAWjYBSMglEwCkbBSAcACBAAAeaR9cIAAAAASUVORK5CYII=" rel="icon" type="image/x-icon" />
        <!-- UIkit CSS -->
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/uikit@3.15.10/dist/css/uikit.min.css" />

        <!-- UIkit JS -->
        <script src="https://cdn.jsdelivr.net/npm/uikit@3.15.10/dist/js/uikit.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/uikit@3.15.10/dist/js/uikit-icons.min.js"></script>
        
        <!-- Copy to clipboard library -->
        <script src="https://cdn.jsdelivr.net/npm/clipboard@2.0.10/dist/clipboard.min.js"></script>
        <script async defer data-website-id="187f30f1-637c-4531-a9db-c57fff142a5a" src="https://umm.jbh.cloud/ummsts.js"></script>
    </head>
    <body>
        <div class="uk-container uk-position-center uk-overlay uk-overlay-default">
            <h1 class="uk-heading-medium">A link shortener for internet people</h1>
            <div class="uk-card uk-card-default">
                <div class="uk-card-body">
                    
                    <form id="submit-form">
                        <div class="uk-flex uk-flex-center">
                            <input id="url" class="uk-input" type="text" placeholder="Enter a url to shorten">
                            <input class="uk-button uk-button-primary uk-align-right" type="submit" value="Generate">
                        </div>
                    </form>
                    
                    <div class="uk-flex uk-flex-center">
                        <div id="form-progress-indicator" uk-spinner="" class="uk-icon uk-spinner" hidden="hidden">
                            <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                                <circle fill="none" stroke="#000" cx="15" cy="15" r="14"></circle>
                            </svg>
                        </div>
                    </div>
                    
                    <div id="results-div" class="uk-flex uk-flex-center" hidden="hidden">
                        <p id="form-validation-error" class="uk-text-large" style="color: red" hidden="hidden"></p>
                        <p id="shortened-url" class="uk-text-large uk-align-left"  hidden="hidden"></p>
                        <button id="copy-to-clip-btn" class="btn uk-button uk-button-default uk-align-right"
                                data-clipboard-target="#shortened-url" hidden="hidden">
                            Copy
                        </button>
                    </div>
                    <div class="uk-flex uk-flex-center">
                        <p id="shortened-url-disclaimer" class="uk-text-small" hidden="hidden">*Shortened urls can take up-to 60 seconds to take affect</p>
                    </div>    
                </div>
               
        </div>
            
        <script type="text/javascript">
            function getFormUrlString(){return document.getElementById("url").value}function isValidHttpUrl(t){let e;try{e=new URL(t)}catch{return!1}return"http:"===e.protocol||"https:"===e.protocol}function showCopyToClipBtn(t){let e=document.getElementById("copy-to-clip-btn"),r=e.getAttribute("hidden");t&&r?e.removeAttribute("hidden"):e.setAttribute("hidden","hidden")}function setResultsText(t){let e=document.getElementById("shortened-url");e.innerHTML=t}function showResultsText(t){let e=document.getElementById("shortened-url"),r=e.getAttribute("hidden");t&&r?e.removeAttribute("hidden"):(e.setAttribute("hidden","hidden"),e.innerHTML="")}function setErrorText(t){console.log("setErrorText() -> "+t);let e=document.getElementById("form-validation-error");e.innerHTML=t}function showErrorText(t){let e=document.getElementById("form-validation-error"),r=e.getAttribute("hidden");t&&r?e.removeAttribute("hidden"):(e.setAttribute("hidden","hidden"),e.innerHTML="")}function showResultDisclaimerText(t){let e=document.getElementById("shortened-url-disclaimer"),r=e.getAttribute("hidden");t&&r?e.removeAttribute("hidden"):e.setAttribute("hidden","hidden")}function showOutput(t){let e=document.getElementById("results-div");t?(e.removeAttribute("hidden"),e.classList.add("uk-animation-slide-top-small"),setTimeout(()=>{e.classList.remove("uk-animation-slide-top-small")},100)):e.setAttribute("hidden","hidden")}function validateForm(){console.log("validateForm()");let t=!0;return isValidHttpUrl(getFormUrlString())||(setErrorText("Url must be in format of http(s)://example.com"),t=!1),console.log("validateForm() success -> "+t),t}function resetOutputIfRequired(){showCopyToClipBtn(!1),setResultsText(""),showResultsText(!1),setErrorText(""),showErrorText(!1),showResultDisclaimerText(!1),showOutput(!1)}function toggleFormProgress(){let t=document.getElementById("form-progress-indicator");t.getAttribute("hidden")?t.removeAttribute("hidden"):t.setAttribute("hidden","hidden")}async function handleSubmit(t){t.preventDefault(),resetOutputIfRequired();let e=!1;if(toggleFormProgress(),validateForm()){let r={url:getFormUrlString()};console.log("data -> "+JSON.stringify(r));let i=await fetch("/api/generate-link",{method:"POST",body:JSON.stringify(r)});if(i.ok){console.log("response.ok");let o=await i.json();setResultsText(o.url),showResultsText(!0),showResultDisclaimerText(!0),showCopyToClipBtn(!0),e=!0}else console.log("! response.ok"),setErrorText("An unexpected error occured")}e||showErrorText(!0),console.log("success -> "+e),showOutput(!0),toggleFormProgress()}var form=document.getElementById("submit-form");form.attachEvent?form.attachEvent("submit",handleSubmit):form.addEventListener("submit",handleSubmit);var clipboard=new ClipboardJS(".btn");clipboard.on("success",function(t){let e=document.getElementById("shortened-url");e.classList.add("uk-animation-shake"),setTimeout(()=>{e.classList.remove("uk-animation-shake")},100),t.clearSelection()}),clipboard.on("error",function(t){console.error("Action:",t.action),console.error("Trigger:",t.trigger)});
        </script>
    </body>
</html>
`

export async function homepageHandler(request: IRequest): Promise<Response> {
    try {
        return new Response(html, {headers: {'content-type': 'text/html;charset=UTF-8'}})
    } catch (e) {
        request.sentry.captureException(e)
        return new Response('error', {status: 500})
    }
}