import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { Extension } from '@tiptap/core';


declare module '@tiptap/core' {
  interface Commands<ReturnType = any> {
    fontSize: {
      setFontSize: (size: string) => ReturnType
    }
  }
}
// Custom fontSize extension
const FontSize = Extension.create({
  name: 'fontSize',

  addOptions() {
    return {}
  },

  addCommands() {
    return {
      setFontSize:
        (size: string) =>
          ({ commands }) => {
            return commands.setMark('textStyle', { fontSize: size })
          },
    }
  },

  // 声明自定义命令类型（关键）
  addKeyboardShortcuts() {
    return {}
  },

  // 注册到命令系统（关键类型定义）
  addStorage() {
    return {}
  },
})

interface RichTextEditorProps {
  content: string;
  onChange: (newContent: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange }) => {
  // Initialize the editor with necessary extensions
  const editor = useEditor({
    extensions: [StarterKit, TextStyle, Color, FontSize],  // Added FontSize extension here
    content,
    onUpdate({ editor }) {
      onChange(editor.getHTML()); // Send updated content to parent
    },
  });

  // Font size change handler
  const setFontSize = (size: string) => {
    editor?.commands.setFontSize(size); // Use the custom setFontSize command
  };

  // Color change handler
  const setColor = (color: string) => {
    editor?.commands.setMark('textStyle', { color });
  };

  // Toggle bold text
  const toggleBold = () => {
    editor?.commands.toggleBold();
  };

  // Font family change handler
  const setFontFamily = (fontFamily: string) => {
    editor?.commands.setMark('textStyle', { fontFamily });
  };

  // Ensure the editor content is updated if `content` prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      {/* Toolbars with buttons */}
      <div style={{ padding: '10px', display: 'flex', flexDirection: 'column' }}>
        <button onClick={toggleBold} style={{ marginBottom: '10px' }}>
          <strong>BOLD</strong>
        </button>

        {/* Font family buttons */}
        {/* <div style={{ marginBottom: '10px' }}>
          <span>FONT FAMILY: </span>
          <button onClick={() => setFontFamily('Arial')}>Arial</button>
          <button onClick={() => setFontFamily('Georgia')}>Georgia</button>
          <button onClick={() => setFontFamily('Courier New')}>Courier New</button>
        </div> */}

        {/* Font size buttons */}
        {/* <div style={{ marginBottom: '10px' }}>
          <button onClick={() => setFontSize('10px')}>小字体</button>
          <button onClick={() => setFontSize('30px')}>中字体</button>
          <button onClick={() => setFontSize('70px')}>大字体</button>
        </div> */}

        {/* Color buttons */}
        <div>
          <span>COLOR: </span>
          <button onClick={() => setColor('red')}>Red</button>
          <span>   </span>
          <button onClick={() => setColor('blue')}>Blue</button>
          <span>   </span>
          <button onClick={() => setColor('green')}>Green</button>
        </div>
      </div>

      {/* Editor content area */}
      <div style={{ flex: 1, border: '1px solid #ccc', padding: '8px' }}>
        <EditorContent editor={editor} />
      </div>

      {/* Preview area */}
      <div
        style={{
          flex: 1,
          padding: '8px',
          border: '1px solid #ccc',
          background: '#f9f9f9',
          whiteSpace: 'pre-wrap',
        }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
};

export default RichTextEditor;
