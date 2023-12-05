import React, { useState, useEffect } from 'react';
import { Editor, EditorState, RichUtils, getDefaultKeyBinding, convertToRaw, CharacterList,convertFromRaw,Modifier ,genKey,BlockMapBuilder,ContentBlock} from 'draft-js';
import 'draft-js/dist/Draft.css';


const MyEditor = () => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  useEffect(() => {
    const savedContent = localStorage.getItem('editorContent');
    if (savedContent) {
      const contentState = convertFromRaw(JSON.parse(savedContent));
      setEditorState(EditorState.createWithContent(contentState));
    }
  }, []);

  const handleKeyCommand = (command, state) => {
    const newState = RichUtils.handleKeyCommand(state, command);

    if (newState) {
      setEditorState(newState);
      return 'handled';
    }
    return 'not-handled';
  };

  const keyBindingFn = (e) => {
    if (e.keyCode === 32 && e.shiftKey && e.altKey) {
      return 'code-block';
    }
    return getDefaultKeyBinding(e);
  };

  const handleInputChange = (newEditorState) => {
    setEditorState(newEditorState);
  };

  const handleSave = () => {
    const contentState = editorState.getCurrentContent();
    localStorage.setItem('editorContent', JSON.stringify(convertToRaw(contentState)));
  };

  const customStyleMap = {
    redUnderline: {
      textDecoration: 'underline',
      color: 'red',
    },
    redText: {
        color: 'red',
      },
    codeBlock: {
      backgroundColor: '#f3f3f3',
      fontFamily: 'monospace',
      padding: '10px',
      borderRadius: '5px',
    },
  };

const handleReturn = (e) => {
    
    if (e.key === 'Enter') {
      e.preventDefault();
  
      const contentState = editorState.getCurrentContent();
      const selectionState = editorState.getSelection();
      const currentBlock = contentState.getBlockForKey(selectionState.getStartKey());
  
      // Check if the current block is empty or contains only whitespace
      if (!currentBlock.getText().trim()) {
        // If the current block is empty, insert a soft newline character
        const newContentState = Modifier.insertText(contentState, selectionState, '\n');
        const newState = EditorState.push(editorState, newContentState, 'insert-char');
        setEditorState(EditorState.forceSelection(newState, newContentState.getSelectionAfter()));
      } else {
        // If the current block is not empty, insert a new empty block below
        const newContentState = Modifier.splitBlock(contentState, selectionState);
        const newState = EditorState.push(editorState, newContentState, 'split-block');
        setEditorState(EditorState.forceSelection(newState, newContentState.getSelectionAfter()));
      }
  
      return 'handled';
    }
    return 'not-handled';
  };

  const handleBeforeInput = (char) => {
    const selection = editorState.getSelection();
    const content = editorState.getCurrentContent();
    const block = content.getBlockForKey(selection.getStartKey());
    const blockType = block.getType();
    const blockText = block.getText();


    if (char === '#') {
        handleInputChange(
          EditorState.push(
            editorState,
            Modifier.insertText(content, selection, '#', null, null),
            'insert-char'
          )
        );
        return 'handled';
      }
   
      if (char === ' ') {
        const trimmedText = blockText.trim();
        const blockWithoutSpace = blockText.replace(/\s/g, ''); // Remove all spaces
        if (trimmedText === '#' && blockWithoutSpace === '#') {
          const newBlockText = trimmedText.substring(1); // Remove '#'
          const newContentState = Modifier.replaceText(content, selection.merge({ anchorOffset: 0 }), newBlockText);
          const newEditorState = EditorState.push(editorState, newContentState, 'remove-range');
          handleInputChange(RichUtils.toggleBlockType(newEditorState, 'header-one'));
          return 'handled';
        }

        if (trimmedText === '*' && blockWithoutSpace === '*') {
            const newBlockText = trimmedText.substring(1); // Remove '*'
            const newContentState = Modifier.replaceText(content, selection.merge({ anchorOffset: 0 }), newBlockText);
            const newEditorState = EditorState.push(editorState, newContentState, 'remove-range');
            handleInputChange(RichUtils.toggleInlineStyle(newEditorState, 'BOLD'));
            return 'handled';
          }
          if (trimmedText === '**' && blockWithoutSpace === '**') {
            const newBlockText = trimmedText.substring(2); // Remove '**'
            const newContentState = Modifier.replaceText(content, selection.merge({ anchorOffset: 0 }), newBlockText);
            const newEditorState = EditorState.push(editorState, newContentState, 'remove-range');
            handleInputChange(RichUtils.toggleInlineStyle(newEditorState, 'redText'));
            return 'handled';
          }
          if (trimmedText === '***' && blockWithoutSpace === '***') {
            const newBlockText = trimmedText.substring(3); // Remove '***'
            const newContentState = Modifier.replaceText(content, selection.merge({ anchorOffset: 0 }), newBlockText);
            const newEditorState = EditorState.push(editorState, newContentState, 'remove-range');
            const newState = RichUtils.toggleInlineStyle(newEditorState, 'UNDERLINE');
            handleInputChange(newState);
            return 'handled';
          }   
      }
    return 'not-handled';
  };

  return (
    <div>
      <h1>Title</h1>
      <button onClick={handleSave}>Save</button>
      <div className="editor-container">
        <Editor
          editorState={editorState}
          onChange={handleInputChange}
          handleKeyCommand={handleKeyCommand}
          keyBindingFn={keyBindingFn}
          customStyleMap={customStyleMap}
          handleReturn={handleReturn}
          handleBeforeInput={handleBeforeInput}
        />
      </div>
    </div>
  );
};

export default MyEditor;
