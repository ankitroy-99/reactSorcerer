import React from "react";
import ReactDOM from "react-dom";
import { Editor, EditorState, RichUtils, Modifier } from "draft-js";
import "draft-js/dist/Draft.css";
import './myDraft.css';

const Draft = () => {
  const [editorState, setEditorState] = React.useState(() =>
    EditorState.createEmpty()
  );
  const editor = React.useRef(null);

  React.useEffect(() => {
    const storedContent = localStorage.getItem('draftEditorContent');
    if (storedContent) {
      setEditorState(EditorState.createWithContent(JSON.parse(storedContent)));
    }
  }, []);
  console.log("editorState => ", editorState);

  function focusEditor() {
    editor.current.focus();
  }


  const handleKeyCommand = (command, newEditorState) => {
    const newState = RichUtils.handleKeyCommand(newEditorState, command);
    console.log('command',command)
    console.log('newEditorState',newEditorState)
    console.log('****newState',newState)
    if (newState) {
      setEditorState(newState);
      return 'handled';
    }

    return 'not-handled';
  };





  const handleEditorChange = (newEditorState) => {
    const contentState = newEditorState.getCurrentContent();
    const selection = newEditorState.getSelection();
    const blockKey = selection.getStartKey();
    const currentContentBlock = contentState.getBlockForKey(blockKey);
  
    const triggerText = currentContentBlock.getText().split(' ')[0];
    const blockText = currentContentBlock.getText();
  
    let newContentState = contentState;
  
    if (triggerText === '#') {
      if (blockText.startsWith('# ') && blockText.charAt(0) === '#') {
        newContentState = Modifier.setBlockType(
          contentState,
          selection,
          'header-one'
        );

  console.log('# newContentState',newContentState)
        newContentState = Modifier.replaceText(
          newContentState,
          selection.merge({
            anchorOffset: 0,
            focusOffset: 2,
          }),
          '',
          null,
          null
        );
      }
    }
    else if (triggerText.startsWith('*')) {
      const asteriskLength = triggerText.length;
  
      if (asteriskLength > 0 && triggerText[asteriskLength - 1] === '*' && asteriskLength !== 1) {
        const boldSelection = selection.merge({
          anchorOffset: 0,
          focusOffset: currentContentBlock.getLength(),
        });
  
        const boldAppliedContent = Modifier.replaceText(
          contentState,
          boldSelection,
          currentContentBlock.getText().substring(asteriskLength), // Excluding the trigger text
          currentStyle => currentStyle.add('BOLD') // Apply BOLD style
        );
  
        newContentState = EditorState.push(
          newEditorState,
          boldAppliedContent,
          'change-inline-style'
        );
        setEditorState(newContentState);
        //return;
      }
    }
     else if (triggerText === '**') {
      const newSelection = selection.merge({
        anchorOffset: 2, // Skip trigger text
        focusOffset: blockText.length,
      });
    
      // Apply redline style to entire line except trigger text
      newContentState = Modifier.replaceText(
        contentState,
        newSelection,
        ' ', // Add space before content to avoid selection overlap
        { style: 'CUSTOM_REDLINE_STYLE' }, // Apply redline style
      );
    
      // Remove trigger text and apply redline style to space before content
      newContentState = Modifier.replaceText(
        newContentState,
        newSelection.merge({ anchorOffset: 0, focusOffset: 2 }),
        '', // Remove trigger text
        { style: 'CUSTOM_REDLINE_STYLE' }, // Apply redline style to space
      );
    
      if (newContentState !== contentState) {
        const newState = EditorState.push(newEditorState, newContentState, 'change-block-data');
        setEditorState(newState);
      } else {
        setEditorState(newEditorState);
      }
    } else if (triggerText === '***') {
        if (
          blockText.startsWith('*** ') &&
          blockText.charAt(0) === '*' &&
          blockText.charAt(1) === '*' &&
          blockText.charAt(2) === '*'
        ) {
          const blockSelection = selection.merge({
            anchorOffset: 0,
            focusOffset: blockText.length,
          });
    
          const blockWithoutTrigger = Modifier.replaceText(
            contentState,
            blockSelection.merge({
              anchorOffset: 0,
              focusOffset: 4,
            }),
            '',
            null,
            null
          );
    
          const blockWithUnderline = Modifier.replaceInlineStyle(
            blockWithoutTrigger,
            blockSelection,
            'UNDERLINE'
          );
    
          newContentState = Modifier.replaceWithFragment(
            contentState,
            selection,
            blockWithUnderline
          );
        }
      }
  
      if (newContentState !== contentState) {
        const newState = EditorState.push(newEditorState, newContentState, 'change-block-data');
        setEditorState(newState);
      } else {
        setEditorState(newEditorState);
      }
  };
  
  
  

  const saveContent = () => {
    const contentState = editorState.getCurrentContent();
    localStorage.setItem('draftEditorContent', JSON.stringify(contentState));
  };

  return (
    <div className="main-container">
      <div className="header-container">
        <h3>Demo Editor</h3>
        <button onClick={saveContent}>Save</button>
      </div>
      <div
        style={{ border: "1px solid black", minHeight: "10em", cursor: "text" }}
        onClick={focusEditor}
      >
        <Editor
          ref={editor}
          editorState={editorState}
          onChange={handleEditorChange}
          handleKeyCommand={handleKeyCommand}
          placeholder="Write something!"
        />
      </div>
    </div>
  );
};

export default Draft;
