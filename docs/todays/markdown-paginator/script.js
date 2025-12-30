/* jshint esversion: 8 */
/* global globalThis, hljs*/
/* Try this editor https://phcode.io/ that has jshint plugin */

/////////////
// DIVIDER //
/////////////
// Panels with divider: mouse and touch management
{
  let dividers=document.getElementsByClassName("divider");
  for (let i = 0; i < dividers.length; i++) {
    let divider = dividers[i];
    divider.innerHTML = "<div></div>"; // add a DIV inside the divider

    // Get the elements
    let container = divider.parentNode;
    let containerCSS = getComputedStyle(container);
    let prev_panel = divider.previousElementSibling;
    let next_panel = divider.nextElementSibling;

    let valid_divider = true;
    if (!container.classList.contains("divider_container")) {valid_divider = false;}
    if (!prev_panel.classList.contains("divider_panel")) {valid_divider = false;}
    if (!next_panel.classList.contains("divider_panel")) {valid_divider = false;}

    // mouse move or touch: divide left/right or up/down based on mouse position
    const _moveListener = (event) => { // jshint ignore:line
      container.style.setProperty('--divider-color', containerCSS.getPropertyValue('--active-color'));
      let mouseXInContainer;
      let mouseYInContainer;
      if (event.constructor.name === "MouseEvent") {
        event.preventDefault();
        mouseXInContainer = event.clientX - container.offsetLeft;
        mouseYInContainer = event.clientY - container.offsetTop;
      }
      else if (event.constructor.name === "TouchEvent") {
        mouseXInContainer = event.touches[0].clientX - container.offsetLeft;
        mouseYInContainer = event.touches[0].clientY - container.offsetTop;
      }

      let perc;
      let flex_direction = containerCSS.getPropertyValue("flex-direction");
      if (flex_direction === "row") {
        perc = (mouseXInContainer / container.offsetWidth) * 100;
      }
      else if (flex_direction === "column") {
        perc = (mouseYInContainer / container.offsetHeight) * 100;
      }
      // Magnetization
      {
        let magnet = 5;
        // Magnet at start
        if (perc <= magnet) perc=0;
        // Magnet at end
        else if (perc >= 100-magnet) perc=100;
        // Magnet at center
        else if (perc > 50-(magnet/2) && perc < 50+(magnet/2)) perc = 50;
        // Magnet at 1/4
        else if (perc > 25-(magnet/2) && perc < 25+(magnet/2)) perc = 25;
        // Magnet at 3/4
        else if (perc > 75-(magnet/2) && perc < 75+(magnet/2)) perc = 75;
      }
      prev_panel.style.flexBasis = perc + '%';
      next_panel.style.flexBasis = (100 - perc) + '%';
    };

    if (valid_divider) {
      // Divider: mouse listener
      // mouse down on the divider: start listening for move and up
      divider.addEventListener('mousedown', (downEvent) => { // jshint ignore:line
        downEvent.preventDefault();
        // mouse up: remove all mouse listeners
        const _upListener = (e) => {
          e.preventDefault();
          container.style.removeProperty('--divider-color');
          container.removeEventListener('mousemove', _moveListener);
          document.removeEventListener('mouseup', _upListener);
        };

        // mouse move: divide left/right width based on mouse position
        container.addEventListener('mousemove', _moveListener);
        // best to make the ending event on the entire document to better catch it
        document.addEventListener('mouseup', _upListener);
      });

      // Divider: touch listener
      // mouse down on the divider: start listening for move and up
      divider.addEventListener('touchstart', (start) => { // jshint ignore:line
        // mouse up: remove all touch listeners
        const _upListener = (e) => {
          container.style.removeProperty('--divider-color');
          container.removeEventListener('touchmove', _moveListener);
          document.removeEventListener('touchend', _upListener);
        };

        // mouse move: divide left/right width based on mouse position
        container.addEventListener('touchmove', _moveListener, { passive: true });
        // best to make the ending event on the entire document to better catch it
        document.addEventListener('touchend', _upListener, { passive: true });
      }, { passive: true });
    }
  }
} // Panels with divider: mouse and touch management

// Switch the horizontal/vertical direction of the panels
function switchPanels(divider){
  let direction = divider.getAttribute("direction");
  if (direction == "vertical") divider.setAttribute("direction", "horizontal");
  else if (direction == "horizontal") divider.setAttribute("direction", "vertical");
}

function sleep(ms) {
  /*
  // sleep function
  // Example to use
  async function myFunc() { // you must use async
    alert("Start");
    await sleep(1000);      // You must use await
    alert("End");
  }
  */
  return new Promise(resolve => setTimeout(resolve, ms));
}

//////////////
// MARKDOWN //
//////////////
const {Marked} = globalThis.marked;
const {markedHighlight} = globalThis.markedHighlight;
var markdown_timestamp = 0; // Timestamp: define the last update request
var markdown_timer_working = false; // Flag "if timer working"
// Update the markdown preview
function updateMarkdown() {
  markdown_timestamp = Date.now();
  if (!markdown_timer_working) {
    markdown_timer_working = true;
    setTimeout(_updateMarkdown, 0);
  }
  
  // Update the Markdown preview
  async function _updateMarkdown() {
    let container = document.getElementsByClassName('paging')[0];
    container.setAttribute("wait", "");
    while(markdown_timer_working) {
      let timestamp = markdown_timestamp;
      await sleep(200);
      if (markdown_timestamp != timestamp) continue;
      
      let md_source = document.getElementById('markdown_source');
      let md_preview = container.children[0].children[0].children[2];
      /*                                  ↑           ↑           ↑
                                          pages       1st page    content
      */

      // Before making any changes, read the current scroll!
      let scrollStartTop = container.scrollTop;
      let scrollStartLeft = container.scrollLeft;
      let scrollStartWidth = container.scrollWidth;
      let scrollStartHeight = container.scrollHeight;

      let marked = new Marked(
        markedHighlight({
          langPrefix: 'hljs language-',
          highlight(code, lang, info) { // jshint ignore:line
            const language = hljs.getLanguage(lang) ? lang : 'plaintext';
            return hljs.highlight(code, { language }).value;
          }
        })
      );

      marked.use({
        async: false,
        pedantic: false,
        gfm: true,
      });

      md_preview.innerHTML = marked.parse(md_source.value);
      if (markdown_timestamp != timestamp) continue;

      // Setting global variables
      {
        let themeLight = true;
        let accentColor = "dark";
        let global_text_font = getComputedStyle(document.body).getPropertyValue("--text-font"); // DEBUG: NEW FEATURE?
        let global_title_font = getComputedStyle(document.body).getPropertyValue("--title-font"); // DEBUG: NEW FEATURE?
        let global_code_font = getComputedStyle(document.body).getPropertyValue("--code-font"); // DEBUG: NEW FEATURE?
        container.style.removeProperty("font-size");

        for (let i=0; i<md_preview.children.length; i++) {
          if (markdown_timestamp != timestamp) continue;
          let theChild = md_preview.children[i];
          let theCommand = theChild.innerHTML.split(" ");

          let isGlobalVariable = true;
          switch (theCommand[0]) {
            case "--theme":
              if (theCommand.length>=2) {
                // 1st parameter: dark or light?
                if (theCommand[1] == "dark") {
                  themeLight = false;
                  accentColor = "light";
                }
                // 2nd parameter: accent color
                if (theCommand.length >= 3) {
                  accentColor = theCommand[2];
                }
              }
              break;

            case "--text-font":
            case "--title-font":
            case "--code-font":
              if (theCommand.length > 1) {
                let theOptions = theCommand.splice(1, theCommand.length-1).join(" ");
                theOptions = "var(--font-" + theOptions.toLowerCase().replaceAll(" ", "-") + ")";
                md_source.style.setProperty(theCommand[0], theOptions);
                container.style.setProperty(theCommand[0], theOptions);
              }
              break;
            case "--font-size":
              if (theCommand.length == 2) {
                container.style.setProperty("font-size", theCommand[1]);
              }
              break;

            default:
              isGlobalVariable = false;
          }

          if (isGlobalVariable) {
            i--;
            theChild.parentNode.removeChild(theChild);
          }
          else break;
        }
        if (markdown_timestamp != timestamp) continue;

        // Apply the theme
        let body = document.body;
        if (themeLight) {
          container.setAttribute("theme", "light");
          body.setAttribute("theme", "light");
        }
        else {
          container.setAttribute("theme", "dark");
          body.setAttribute("theme", "dark");
        }
        container.setAttribute("accent", accentColor);
        body.setAttribute("accent", accentColor);

      } // setting global variables
      
      // Make an index like a book
      {
        // Search for --index commands
        let bookIndex = [];
        for (let i=0; i<md_preview.children.length; i++) {
          if (markdown_timestamp != timestamp) continue;
          let element = md_preview.children[i];
          if (element.tagName == "P" && element.innerHTML == "--index") {
            bookIndex.push(element);
            bookIndex[bookIndex.length-1].innerHTML = '';
            bookIndex[bookIndex.length-1].classList.add("bookindex");
          }
        }
        if (markdown_timestamp != timestamp) continue;
        
        // Populate book index
        if (bookIndex.length > 0) {
          let heads = [0,0,0,0,0,0];
          let h1_usable = false; // H1 is usable for book index?
          if (md_preview.querySelectorAll(".paging > .pages > .page > .content h1").length > 1) {
            h1_usable = true;
          }
          for (let i=0; i<md_preview.children.length; i++) {
            if (markdown_timestamp != timestamp) continue;
            let element = md_preview.children[i];
            switch (element.tagName) {
              case "H1":
                if (!h1_usable) break; // jshint ignore:line
              case "H2":
              case "H3":
              case "H4":
              case "H5":
              case "H6":
                let i_heads = parseInt(element.tagName.charAt(1))-1;
                heads[i_heads]++;
                for (let x=i_heads+1; x<heads.length; x++) heads[x] = 0; // apply trailing zeros
                let id = heads.join("-");
                element.setAttribute("id", id);
                
                // Create content for book index
                if (!h1_usable) i_heads--;
                let inner = '<div class="title" style="padding-left:' + i_heads + 'em;">' + element.innerHTML + '</div>';
                inner += '<div class="spacer"></div>';
                inner += '<div class="page">🚧</div>';
                for (let bi=0; bi<bookIndex.length; bi++) {
                  if (markdown_timestamp != timestamp) continue;
                  if (bookIndex[bi].innerHTML == "") {
                    bookIndex[bi].innerHTML = inner;
                  }
                  else {
                    bookIndex[bi].after(document.createElement('p'));
                    bookIndex[bi] = bookIndex[bi].nextSibling;
                    bookIndex[bi].classList.add("bookindex");
                    bookIndex[bi].innerHTML = inner;
                    i++;
                  }
                  bookIndex[bi].classList.add(id);
                  // Scroll to the head
                  bookIndex[bi].onclick = function() { // jshint ignore:line
                    // Get elements
                    let theHead = document.getElementById(id);
                    let thePaging = theHead.closest(".paging");
                    
                    // Calculate coordinates
                    let zoom_value = getComputedStyle(container).getPropertyValue("--zoom");
                    let y = theHead.getBoundingClientRect().top / zoom_value; // Get y position of the head (adapt if zoom)
                    y += thePaging.scrollTop;                                 // Adapt the scrolled container
                    y -= thePaging.getBoundingClientRect().top / zoom_value;  // Make y position relative for the container (adapt if zoom)
                    let x = thePaging.scrollLeft;                             // Do not scroll the x axis
                    
                    // Scroll to element
                    thePaging.scrollTo({
                      top: y,
                      left: x,
                      behavior: "smooth",
                    });
                  };
                }
                if (markdown_timestamp != timestamp) continue;
            }
          }
          if (markdown_timestamp != timestamp) continue;
          // If there is no heads: delete the void book index
          let headExists = false;
          for (let h=0; h<heads.length; h++) {
            if (markdown_timestamp != timestamp) continue;
            if (heads[h] != 0) {
              headExists = true;
              break;
            }
          }
          if (markdown_timestamp != timestamp) continue;
          if (!headExists) {
            for (let bi=0; bi<bookIndex.length; bi++) {
              if (markdown_timestamp != timestamp) continue;
              bookIndex[bi].parentNode.removeChild(bookIndex[bi]);
            }
            if (markdown_timestamp != timestamp) continue;
          }
        } // processing --index commands
      } // search for --index commands

      // All anchors have target="blank"
      {
        let anchors = md_preview.getElementsByTagName("a");
        for (let i = 0; i< anchors.length; i++) {
          if (markdown_timestamp != timestamp) continue;
          anchors[i].setAttribute("target", "_blank");
        }
        if (markdown_timestamp != timestamp) continue;
      }

      // Blockquote accent like message standard colors
      {
        let quotes = md_preview.getElementsByTagName("blockquote");
        for (let i = 0; i < quotes.length; i++) {
          if (markdown_timestamp != timestamp) continue;
          let e = quotes[i];
          let borderColor = "";
          if (e.children.length > 0) {
            let firstChild = e.children[0];
            switch (firstChild.tagName) {
              case "H1":
              case "H2":
              case "H3":
              case "H4":
              case "H5":
              case "H6":
                if (firstChild.innerHTML.toLowerCase().indexOf("⛔") == 0)      borderColor = "error";
                else if (firstChild.innerHTML.toLowerCase().indexOf("⚠️") == 0) borderColor = "warning";
                else if (firstChild.innerHTML.toLowerCase().indexOf("ℹ️") == 0)  borderColor = "info";

                if (borderColor != "") {
                  e.classList.add(borderColor);
                  firstChild.innerHTML = firstChild.innerHTML.substring(1); // Remove the control emoticon
                }
            }
          }
        }
        if (markdown_timestamp != timestamp) continue;
      }

      // Alternate quote color
      {
        let quotes = md_preview.getElementsByTagName("blockquote");
        for (let i = 0; i < quotes.length; i++) {
          if (markdown_timestamp != timestamp) continue;
          let quote = quotes[i];
          let quoteCSS = getComputedStyle(quote);
          let parentCSS = getComputedStyle(quote.parentNode);
          let quote_color = quoteCSS.getPropertyValue('--blockquote-color');
          let parent_color = parentCSS.getPropertyValue('--blockquote-color');
          let quote_1 = quoteCSS.getPropertyValue('--blockquote-1-color');
          let quote_2 = quoteCSS.getPropertyValue('--blockquote-2-color');
          if (quote_color == parent_color) {
            if (quote_color == quote_1) {
              quote.style.setProperty('--blockquote-color', quote_2);
            }
            else {
              quote.style.setProperty('--blockquote-color', quote_1);
            }
          }
        }
        if (markdown_timestamp != timestamp) continue;
      }

      // Alternate style type for nested unordered lists
      {
        let u_lists = md_preview.getElementsByTagName("ul");
        for (let i = 0; i < u_lists.length; i++) {
          if (markdown_timestamp != timestamp) continue;
          let u_list = u_lists[i];
          let u_listCSS = getComputedStyle(u_list);
          let parentCSS = getComputedStyle(u_list.parentNode);
          let parent_style = parentCSS.getPropertyValue('--style-type');
          let style_1 = u_listCSS.getPropertyValue('--style-type-1');
          let style_2 = u_listCSS.getPropertyValue('--style-type-2');
          let style_3 = u_listCSS.getPropertyValue('--style-type-3');
          switch (parent_style) {
            case style_1:
              u_list.style.setProperty('--style-type', style_2);
              break;
            case style_2:
              u_list.style.setProperty('--style-type', style_3);
              break;
            case style_3:
              u_list.style.setProperty('--style-type', style_1);
              break;
          }
        }
        if (markdown_timestamp != timestamp) continue;
      }

      // Images
      {
        let images = md_preview.getElementsByTagName("img");
        for (let i = 0; i < images.length; i++) {
          if (markdown_timestamp != timestamp) continue;
          // Remove empty ALT property
          if (images[i].alt == "") images[i].removeAttribute("alt");
          /*
          Set attribute decoding="sync" to IMG.
          Do not wait to process base64 images
          */
          images[i].setAttribute("decoding", "sync");
          /*
          Set attribute loading="eager" to IMG.
          This should be the default,
          but It's better to be sure.
          */
          images[i].setAttribute("loading", "eager");
          /*
          Decode here and now
          */
          try {await images[i].decode();}
          catch(e) {/* Nothing */}
        }
        if (markdown_timestamp != timestamp) continue;
      }
      
      // All text must support both LTR and RTL direction
      {
        // Set automatic direction
        let set_dir_auto = (collection) => {
          for (let element of collection) {
            element.setAttribute("dir", "auto");
          }
        };
        set_dir_auto(md_preview.getElementsByTagName("p"));
        set_dir_auto(md_preview.getElementsByTagName("h1"));
        set_dir_auto(md_preview.getElementsByTagName("h2"));
        set_dir_auto(md_preview.getElementsByTagName("h3"));
        set_dir_auto(md_preview.getElementsByTagName("h4"));
        set_dir_auto(md_preview.getElementsByTagName("h5"));
        set_dir_auto(md_preview.getElementsByTagName("h6"));
      }
      
      // Wait for the fonts to load
      await document.fonts.ready;
      if (markdown_timestamp != timestamp) continue;
      
      // Paging the document and break the work if a new request is requested. Any question to request?
      if (!paging(container.getElementsByClassName("pages")[0], timestamp)) continue;

      // Restore the scroll
      {
        let scrollEndWidth = container.scrollWidth;
        let scrollEndHeight = container.scrollHeight;
        //startTop:startHeight = endTop:endHeight
        //endTop = (startTop * endHeight) / startHeight;
        let endTop = (scrollStartTop * scrollEndHeight) / scrollStartHeight;
        //startLeft:startWidth = endLeft:endWidth
        //endLeft = (startLeft * endWidth) / startWidth;
        let endLeft = (scrollStartLeft * scrollEndWidth) / scrollStartWidth;
        container.scroll(endLeft, endTop);
      }
      if (markdown_timestamp != timestamp) continue;
      
      markdown_timer_working = false;
      container.removeAttribute("wait");
      return; // Force exit loop and function
    } // while(markdown_timer_working)
  } // function _updateMarkdown
}


/////////////////////
// PAGING MARKDOWN //
/////////////////////
var markdownTitle = "";
function paging(e, timestamp) {
  if (markdown_timestamp != timestamp) return false;
  let pages = e.children;
  let master = 0;
  let populating = 0;
  let masterPage = pages[master];
  let masterHeader = masterPage.children[1]; // header
  let masterContent = masterPage.children[2]; // content
  let masterChilds = masterContent.children;
  let masterFooter = masterPage.children[3]; // footer
  
  let global_text_font = getComputedStyle(e).getPropertyValue("--text-font");
  let global_title_font = getComputedStyle(e).getPropertyValue("--title-font");
  let global_code_font = getComputedStyle(e).getPropertyValue("--code-font");
  
  // Reset default values
  {
    // Reset page attributes
    const removeAttributes = (tmp, className="") => {
      let attributes = tmp.getAttributeNames();
      for (let i=0; i< attributes.length; i++) {
        if (markdown_timestamp != timestamp) return false;
        if (attributes[i] == "class") {
          tmp.setAttribute(attributes[i], className);
        }
        else {
          tmp.removeAttribute(attributes[i]);
        }
      }
      return true;
    };
    if (!removeAttributes(e, "pages")) return false;
    if (!removeAttributes(masterPage, "page")) return false;
    if (!removeAttributes(masterHeader, "header")) return false;
    if (!removeAttributes(masterContent, "content")) return false;
    if (!removeAttributes(masterFooter, "footer")) return false;
    // Remove other pages
    for (let i=pages.length-1; i>0; i--) {
      if (markdown_timestamp != timestamp) return false;
      let lastChild = pages[i];
      // Delete the page only if is ".paging > .pages > .page"
      if (lastChild.parentNode == e){
        lastChild.parentNode.removeChild(lastChild);
      }
    }
  }
  
  // Set the header from the title
  {
    if (masterContent.getElementsByTagName("H1").length > 0) {
      markdownTitle = masterContent.getElementsByTagName("H1")[0].innerHTML;
    }
    else {
      markdownTitle = "";
    }
    masterHeader.innerHTML = markdownTitle;
  }
  
  let pageFormatting = true;
  let simpleFormatting = {"default": true,
                          "align": "default",
                          "width": "default"};
  let text_font = getComputedStyle(e).getPropertyValue("--text-font");
  let title_font = getComputedStyle(e).getPropertyValue("--title-font");
  let code_font = getComputedStyle(e).getPropertyValue("--code-font");
  for (let i=0; i < masterChilds.length; i++) {
    if (markdown_timestamp != timestamp) return false;
    
    // Get the child
    let theChild = masterChilds[i];
    
    // Detect command for paging
    let printable = false;
    if (pageFormatting) {
      let formattingCommand = theChild.innerHTML.split(" ")[0];
      switch (formattingCommand) {
        case "--A0":
        case "--A1":
        case "--A2":
        case "--A3":
        case "--A4":
        case "--A5":
        case "--A6":
        case "--A7":
        case "--A8":
        case "--A9":
        case "--A10":
          let pageWidth = getComputedStyle(e).getPropertyValue(formattingCommand + "-W");
          let pageHeight = getComputedStyle(e).getPropertyValue(formattingCommand + "-H");
          let orientation = "portrait"; // The default orientation
          if (theChild.innerHTML.split(" ").length > 1) {
            orientation = theChild.innerHTML.split(" ")[1];
            if (orientation == "landscape") {
              let tmp = pageWidth;
              pageWidth = pageHeight;
              pageHeight = tmp;
            }
          }
          pages[populating].style.setProperty("--page-width", pageWidth);
          pages[populating].style.setProperty("--page-height", pageHeight);
          theChild.parentNode.removeChild(theChild);
          i--;
          break;
        
        case "--margin-top":
        case "--margin-bottom":
        case "--margin-left":
        case "--margin-right":
          if (theChild.innerHTML.split(" ").length > 1) {
            let tmp = theChild.innerHTML.split(" ");
            tmp.splice(0, 1);
            pages[populating].style.setProperty(formattingCommand, tmp.join(" "));
          }
          theChild.parentNode.removeChild(theChild);
          i--;
          break;
        
        case "--binding-side":
        case "--binding-top":
          if (theChild.innerHTML.split(" ").length > 1) {
            if (formattingCommand == "--binding-side") {
              e.style.setProperty("--binding-top", "0mm");
              e.setAttribute("binding-side","");
            }
            else {
              e.style.setProperty("--binding-side", "0mm");
              e.removeAttribute("binding-side");
            }
            e.style.setProperty(formattingCommand+"", theChild.innerHTML.split(" ")[1] + "");
          }
          theChild.parentNode.removeChild(theChild);
          i--;
          break;
        
        case "--header-no":
          pages[populating].style.setProperty("--header-height", "0mm");
          pages[populating].children[1].style.setProperty("opacity", "0");
          theChild.parentNode.removeChild(theChild);
          i--;
          break;

        case "--header-yes":
          pages[populating].style.removeProperty("--header-height");
          pages[populating].children[1].style.removeProperty("opacity");
          theChild.parentNode.removeChild(theChild);
          i--;
          break;
        
        case "--header-text":
          if (theChild.innerHTML.split(" ").length > 1) {
            let tmp = theChild.innerHTML.split(" ");
            tmp.splice(0, 1);
            pages[populating].children[1].innerHTML = tmp.join(" ");
          }
          theChild.parentNode.removeChild(theChild);
          i--;
          break;

        case "--footer-no":
          pages[populating].style.setProperty("--footer-height", "0mm");
          pages[populating].children[3].style.setProperty("opacity", "0");
          theChild.parentNode.removeChild(theChild);
          i--;
          break;

        case "--footer-yes":
          pages[populating].style.removeProperty("--footer-height");
          pages[populating].children[3].style.removeProperty("opacity");
          theChild.parentNode.removeChild(theChild);
          i--;
          break;

        default:
          printable = true;
      }
    }
    else {
      printable = true;
    }
    
    // If the element is printable
    if (printable) {
      if (pageFormatting) {
        pageFormatting = false;
      }
      
      let requestCommand = true;
      let requestNewPage = false;
      switch (theChild.innerHTML) {
        case "--new-page":
          requestNewPage = true;
          break;
        case ":---":
          simpleFormatting.default = false;
          simpleFormatting.align = "left";
          break;
        case "---:":
          simpleFormatting.default = false;
          simpleFormatting.align = "right";
          break;
        case ":---:":
          simpleFormatting.default = false;
          simpleFormatting.align = "center";
          break;
        case ":::":
          simpleFormatting.align = "default";
          if (simpleFormatting.width == "default") simpleFormatting.default = true;
          break;
        default:
          // Detect :NUMBER%: from :0%: to :100%:
          if ( theChild.innerHTML.length >= 4 &&
          theChild.innerHTML.length <= 6 &&
          theChild.innerHTML.charAt(0) == ":" &&
          theChild.innerHTML.charAt(theChild.innerHTML.length-1) == ":" &&
          theChild.innerHTML.charAt(theChild.innerHTML.length-2) == "%" ) {
            // Reset to default
            if (theChild.innerHTML.substring(1, theChild.innerHTML.length-2) == "---") {
              simpleFormatting.width = "default";
              if (simpleFormatting.align == "default") simpleFormatting.default = true;
            }
            else if ( Number.isInteger(parseInt(theChild.innerHTML.substring(1, theChild.innerHTML.length-2))) &&
                 parseInt(theChild.innerHTML.substring(1, theChild.innerHTML.length-2)) >= 0 &&
                 parseInt(theChild.innerHTML.substring(1, theChild.innerHTML.length-2)) <= 100 ) {
              simpleFormatting.default = false;
              simpleFormatting.width = theChild.innerHTML.substring(1, theChild.innerHTML.length-2) + "%";
            }
            else requestCommand = false;
          }
          // theChild is a font command or not?
          else if (theChild.innerHTML.split(" ").length > 1) {
            let userCommand = theChild.innerHTML.split(" ")[0];
            let commandLength = theChild.innerHTML.split(" ").length;
            let userOptions = theChild.innerHTML.split(" ").splice(1, commandLength-1).join(" ");
            userOptions = "--font-" + userOptions.toLowerCase().replaceAll(" ", "-");
            switch (userCommand) {
              case "--text-font":
                text_font = getComputedStyle(e).getPropertyValue(userOptions);
                break;
              case "--title-font":
                title_font = getComputedStyle(e).getPropertyValue(userOptions);
                break;
              case "--code-font":
                code_font = getComputedStyle(e).getPropertyValue(userOptions);
                break;
              default:
                requestCommand = false;
            }
          }
          else {
            requestCommand = false;
          }
      }
      
      // Manage simple formatting
      if (!simpleFormatting.default) {
        switch (theChild.tagName) {
          case "BLOCKQUOTE":
            if (simpleFormatting.align != "default" && simpleFormatting.align != "left") theChild.classList.add(simpleFormatting.align);
            if (simpleFormatting.width != "default" && simpleFormatting.width != "100%") theChild.style.setProperty("max-width", simpleFormatting.width);
            break;
          case "H1":
            if (simpleFormatting.align != "default" && simpleFormatting.align != "center") theChild.classList.add(simpleFormatting.align);
            if (simpleFormatting.width != "default" && simpleFormatting.width != "100%") theChild.style.setProperty("max-width", simpleFormatting.width);
            break;
          case "H2":
            if (simpleFormatting.align != "default" && simpleFormatting.align != "left") theChild.classList.add(simpleFormatting.align);
            if (simpleFormatting.width != "default" && simpleFormatting.width != "100%") theChild.style.setProperty("max-width", simpleFormatting.width);
            break;
          case "H3":
          case "H4":
          case "H5":
          case "H6":
            if (simpleFormatting.align != "default" && simpleFormatting.align != "left") theChild.style.setProperty("text-align", simpleFormatting.align);
            if (simpleFormatting.width != "default" && simpleFormatting.width != "100%") theChild.style.setProperty("max-width", simpleFormatting.width);
            break;
          case "P":
            if (simpleFormatting.align != "default" && simpleFormatting.align != "left") theChild.classList.add(simpleFormatting.align);
            if (simpleFormatting.width != "default" && simpleFormatting.width != "100%") theChild.style.setProperty("max-width", simpleFormatting.width);
            break;
          case "TABLE":
            if (simpleFormatting.align != "default" && simpleFormatting.align != "left") theChild.classList.add(simpleFormatting.align);
            if (simpleFormatting.width != "default") theChild.style.setProperty("min-width", simpleFormatting.width);
            break;
        }
      }
      
      // Set font
      if (text_font  != global_text_font)  theChild.style.setProperty("--text-font",  text_font);
      if (title_font != global_title_font) theChild.style.setProperty("--title-font", title_font);
      if (code_font  != global_code_font)  theChild.style.setProperty("--code-font",  code_font);
      
      // Move to populating page
      if (requestCommand == false && populating != master) {
        pages[populating].children[2].appendChild(masterChilds[i--]);
      }
      
      // Measure the child on the page
      let childBottom;
      let contentBottom;
      let moveTheChild = false;
      let moveThePrevChild = false;
      let thePrevChild;
      if (!requestCommand) {
        // The child fits?
        childBottom = theChild.getBoundingClientRect().bottom;
        contentBottom = pages[populating].children[2].getBoundingClientRect().bottom;
        if (childBottom > contentBottom) {
          let childPosition = 0;
          let siblings = pages[populating].children[2].children;
          
          if (populating == 0) { // The child is on the first page
            if (i == 0)  { // The child is the first child of the first page
              pages[populating].setAttribute("warning", "");
            }
            else { // The child is NOT the first child of the first page
              moveTheChild = true;
              requestNewPage = true;
              // The ALPHA algorithm must be here too.
              // The logic must be changed so that the algorithm can only be written once.
            }
            childPosition = i;
          }
          else { // The child is NOT on the first page
            childPosition = siblings.length-1;
            if (childPosition == 0) { // The child is the first of the page
              pages[populating].setAttribute("warning", "");
            }
            else if (childPosition > 0) { // The child is NOT the first of the page
              moveTheChild = true;
              requestNewPage = true;
            }
          } // populating page > 0
          /*
          * Actually the child can not fits in the page.
          * If (the actual element is not an H element
          * && the prev sibling is an H element)
          * Then move the child with the H element!
          */
          
          // The child must NOT be head!
          switch (theChild.tagName) {
            case "H1":
            case "H2":
            case "H3":
            case "H4":
            case "H5":
            case "H6":
              break;
            default:
              if (childPosition > 0) {
                // Exists previous sibling? Yes.
                thePrevChild = siblings[childPosition-1];
                // The thePrevChild is H1 H2 H3 H4 H5 H6?
                switch (thePrevChild.tagName) {
                  case "H1":
                  case "H2":
                  case "H3":
                  case "H4":
                  case "H5":
                  case "H6":
                    // Check the position
                    //  0: only theChild → In this part of the algorithm it never happens
                    //  1: theChild and only prev sibling. If prev is H → must set warning
                    // >1: theChild, prev sibling is H and at least another element on the same page
                    if (childPosition == 1) {
                      moveTheChild = false;   // theChild stay with prev sibling
                      requestNewPage = false; // do NOT request for a new page
                      pages[populating].setAttribute("warning", ""); // Show the warning
                    }
                    else /* if (childPosition > 1) */ {
                      // theChild and prev must move together to the new page
                      moveThePrevChild = true;
                    } // else if (childPosition > 2)
                } // prev sibling must be H
              } // prev sibling exists
          } // theChild must NOT be H
        } // theChild is too big
      } // not request command
      else {
        // theChild is a command: don't print it!
        theChild.parentNode.removeChild(theChild);
        i--;
      }
      
      if (requestNewPage) {
        // Create a new page
        pageFormatting = true;
        e.appendChild(document.createElement("div"));
        let nextPage = e.lastChild;
        nextPage.classList.add("page");
        nextPage.setAttribute("style", pages[populating].getAttribute("style"));
        nextPage.appendChild(pages[populating].children[0].cloneNode(true)); // background
        nextPage.appendChild(pages[populating].children[1].cloneNode(true)); // header
        nextPage.appendChild(document.createElement("div"));
        nextPage.lastChild.classList.add("content");
        nextPage.appendChild(pages[populating].children[3].cloneNode(true)); // footer
        nextPage.appendChild(pages[populating].children[4].cloneNode(true)); // warning
        
        // The new page is ready
        populating++;
        
        if (moveTheChild) {
          pageFormatting = false;
          // The child must be moved to the next page
          let nextContent = pages[populating].children[2];
          
          // Move the previous child?
          if (moveThePrevChild) {
            nextContent.appendChild(thePrevChild);
            if (populating == 1) i--;
          }
          
          // Move the child
          nextContent.appendChild(theChild);
          if (populating == 1) i--;
          
          // The moved child fits in the new page?
          childBottom = nextContent.lastChild.getBoundingClientRect().bottom;
          contentBottom = nextContent.getBoundingClientRect().bottom;
          if (childBottom > contentBottom) {
            // If not fits, put a warning
            pages[populating].setAttribute("warning", "");
          }
        }
      } // request new page
      
      // It is head for book index?
      let bookChild = theChild;
      if (moveThePrevChild) bookChild = thePrevChild;
      switch (bookChild.tagName) {
        case "H1":
        case "H2":
        case "H3":
        case "H4":
        case "H5":
        case "H6":
          if (bookChild.hasAttribute("id")) {
            let id = bookChild.getAttribute("id");
            let indexRow = e.getElementsByClassName(id);
            for (let r=0; r<indexRow.length; r++ ) {
              if (markdown_timestamp != timestamp) return false;
              if (indexRow[r].classList.contains("bookindex")) {
                indexRow[r].getElementsByClassName("page")[0].innerHTML = populating+1;
              }
            }
          }
      } // switch for book index
    } // printable element
  } // loop childs
  
  // Total pages
  e.style.setProperty("counter-reset", "pages " + e.children.length);
  return true;
} // function paging

/////////////////
// SYNC SCROLL //
/////////////////
//https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll_snap
var syncScroll = true;
function switchSyncScroll() {
  syncScroll = !syncScroll;
  let scrollStatus = "OFF";
  if (syncScroll) scrollStatus = "ON";
  let theButton = document.querySelector('#markdown_button_panel > .sync_scroll');
  theButton.setAttribute('title','Sync Scroll is '+scrollStatus);
}
// PRIVATE FUNCTIONS
{
  let source = document.getElementById('markdown_source');
  let preview = document.getElementsByClassName('paging')[0];
  
  let source_has_scroll = false;
  let preview_has_scroll = false;
  
  const scroll = (from, to) => {
    if (syncScroll) {
      let from_y_visible = from.clientHeight;
      let from_y_full = from.scrollHeight;
      let from_y_max_position = from_y_full - from_y_visible;
      
      let to_y_visible = to.clientHeight;
      let to_y_full = to.scrollHeight;
      let to_y_max_position = to_y_full - to_y_visible;
      
      let newTop = (from.scrollTop * to_y_max_position) / from_y_max_position;
      to.scroll(to.scrollLeft, newTop);
    }
  };
  
  const source_scroll = () => {
    scroll(source, preview);
  };
  
  const preview_scroll = () => {
    scroll(preview, source);
  };
  
  const source_move = () => {
    if (!source_has_scroll) {
      source_has_scroll = true;
      preview_has_scroll = false;
      preview.removeEventListener("scroll", preview_scroll);
      source.addEventListener("scroll", source_scroll);
    }
  };
  
  const preview_move = () => {
    if (!preview_has_scroll) {
      preview_has_scroll = true;
      source_has_scroll = false;
      source.removeEventListener("scroll", source_scroll);
      preview.addEventListener("scroll", preview_scroll);
    }
  };
  
  source.addEventListener("mousemove", source_move);
  source.addEventListener("touchmove", source_move);
  preview.addEventListener("mousemove", preview_move);
  preview.addEventListener("touchmove", preview_move);
}



//////////////
// TEXTAREA //
//////////////
{
  let source = document.getElementById('markdown_source');
  source.addEventListener('input', updateMarkdown);
  
  // Textarea do not lose focus on TAB
  source.addEventListener('keydown', function(e) {
    if (e.key == 'Tab') {
      e.preventDefault();
      let start = this.selectionStart;
      let end = this.selectionEnd;
      
      // set textarea value to: text before caret + tab + text after caret
      this.value = this.value.substring(0, start) + "\t" + this.value.substring(end);
      
      // put caret at right position again
      this.selectionStart = this.selectionEnd = start + 1;
    }
  });
}

/////////////////////
// OPEN THE SOURCE //
/////////////////////
{
  let input = document.getElementById("open_markdown_source");
  let output = document.getElementById("markdown_source"); 
  input.addEventListener("change", function () {
    if (this.files && this.files[0]) {
      let myFile = this.files[0];
      let reader = new FileReader();
      reader.addEventListener('load', function (e) {
        output.value = e.target.result;
        updateMarkdown();
      });
      reader.readAsText(myFile);
    }
  });
}

/////////////////////
// SAVE THE SOURCE //
/////////////////////
function download() {
  // Put the text into a blob
  let text = document.getElementById("markdown_source").value;
  text = text.replace(/\n/g, "\r\n"); // To retain the Line breaks.
  let blob = new Blob([text], { type: "text/plain"});
  // Prepare the link
  let anchor = document.createElement("a");
  anchor.download = markdownTitle+".md";
  anchor.href = window.URL.createObjectURL(blob);
  anchor.target ="_blank";
  anchor.style.display = "none"; // just to be safe!
  document.body.appendChild(anchor);
  // Download the source
  anchor.click();
  // Delete the link
  document.body.removeChild(anchor);
}

//////////
// ZOOM //
//////////
{
  // GUI elements
  let preview = document.getElementsByClassName('paging')[0];
  let button_panel = document.getElementById("markdown_button_panel");
  let zoom_value = button_panel.getElementsByClassName("zoom_value")[0];
  let zoom_minus = button_panel.getElementsByClassName("zoom_minus")[0];
  let zoom_plus = button_panel.getElementsByClassName("zoom_plus")[0];
  
  // Private functions
  const getZoom = () => {
    return getComputedStyle(preview).getPropertyValue("--zoom");
  };
  
  const setZoom = (val) => {
    if (val == 1) preview.style.removeProperty("--zoom");
    else preview.style.setProperty("--zoom", val);
  };
  
  const changeZoom = (e) => {
    let n = e.target.value;
    let err = true;
    if (!isNaN(n-0)) {
      // Is a Number
      if (n>=0 && n<1000) {
        // 0 <= n < 1000
        err = false;
        setZoom((n/100)+"");
      }
    }
    if (err) {
      e.target.value = getZoom()*100;
    }
  };
  
  const moreZoom = () => {
    let n = getZoom()*100;
    n+=5;
    n = Number.parseInt(n+"");
    n = Math.min(n, 999);
    zoom_value.value = n;
    setZoom(n/100);
  };
  
  const lessZoom = () => {
    let n = getZoom()*100;
    n-=5;
    n = Number.parseInt(n+"");
    n = Math.max(n, 0);
    zoom_value.value = n;
    setZoom(n/100);
  };
  
  zoom_value.addEventListener("input", changeZoom);
  zoom_plus.addEventListener("click", moreZoom);
  zoom_minus.addEventListener("click", lessZoom);
}

///////////
// TOOLS //
///////////
function isMobile() {
  // https://codepen.io/tonywhite1985/pen/dyERbrd
  let agent = (navigator.userAgent||navigator.vendor||window.opera);
  let response = false;
  if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(agent)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(agent.substr(0,4))) response = true;
  return response;
}
// Update DOM: body has mobile class
if (isMobile()) {
  document.body.classList.remove("pc_browser");
  document.body.classList.add("mobile_browser");
}
else {
  document.body.classList.remove("mobile_browser");
  document.body.classList.add("pc_browser");
}

/////////////////
// DRAG WINDOW //
/////////////////
function toggleGuide() {
  let theWindow = document.getElementById('floating_window');
  if (!theWindow.classList.contains("show")) {
    theWindow.removeAttribute("style");
    // Get size and position of the window from CSS.
    // Set it inline to avoid auto-resizing and auto-positioning before resizing
    if(document.body.classList.contains("pc_browser")) {
      theWindow.style.top = theWindow.offsetTop + "px";
      theWindow.style.left = theWindow.offsetLeft + "px";
      theWindow.style.height = theWindow.offsetHeight + "px";
      theWindow.style.width = theWindow.offsetWidth + "px";
    }
  }
  theWindow.classList.toggle('show');
}
if(document.body.classList.contains("pc_browser")) {
  const dragWindow = (e) => {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    const dragMouseDown = (ed) => {
      ed = ed || window.event;
      ed.preventDefault();
      // get the mouse cursor position at startup:
      pos3 = ed.clientX;
      pos4 = ed.clientY;
      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    };

    const elementDrag = (ed) => {
      ed = ed || window.event;
      ed.preventDefault();
      // calculate the new cursor position:
      pos1 = pos3 - ed.clientX;
      pos2 = pos4 - ed.clientY;
      pos3 = ed.clientX;
      pos4 = ed.clientY;
      // set the element's new position:
      e.style.top = (e.offsetTop - pos2) + "px";
      e.style.left = (e.offsetLeft - pos1) + "px";
    };

    const closeDragElement = () => {
      // stop moving when mouse button is released:
      document.onmouseup = null;
      document.onmousemove = null;
    };
    
    e.children[0].onmousedown = dragMouseDown;
  };
  
  const resizeWindow = (e) => {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    const resizeMouseDown = (ed) => {
      ed = ed || window.event;
      ed.preventDefault();
      // get the mouse cursor position at startup:
      pos3 = ed.clientX;
      pos4 = ed.clientY;
      document.onmouseup = closeResizeElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementResize;
    };

    const elementResize = (ed) => {
      ed = ed || window.event;
      ed.preventDefault();
      // calculate the new cursor position:
      pos1 = pos3 - ed.clientX;
      pos2 = pos4 - ed.clientY;
      pos3 = ed.clientX;
      pos4 = ed.clientY;
      // set the element's new size:
      e.style.height = (e.offsetHeight - pos2) + "px";
      e.style.width = (e.offsetWidth - pos1) + "px";
    };

    const closeResizeElement = () => {
      // stop moving when mouse button is released:
      document.onmouseup = null;
      document.onmousemove = null;
    };
    
    e.children[2].onmousedown = resizeMouseDown;
  };
  
  let theWindow = document.getElementById("floating_window");
  dragWindow(theWindow);
  resizeWindow(theWindow);
}