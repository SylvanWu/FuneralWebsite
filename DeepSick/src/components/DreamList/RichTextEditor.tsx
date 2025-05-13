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
  console.log("The initial input content is：", content);
  const editor = useEditor({
    extensions: [StarterKit, TextStyle, Color, FontSize],  // Added FontSize extension here
    content,
    onUpdate({ editor }) {
      const html = editor.getHTML();
      onChange(html);
    },
  });

  // Color change handler
  const setColor = (color: string) => {
    editor?.commands.setMark('textStyle', { color });
  };

  // Toggle bold text
  const toggleBold = () => {
    editor?.commands.toggleBold();
  };

  // Ensure the editor content is updated if `content` prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      console.log("The external content has changed. Rewrite it to the editor", content);
      console.log("Current editor content:", editor.getHTML());
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="rich-text-editor-container">
      {/* Toolbars with buttons */}
      <div className="rich-text-toolbar">
        <button onClick={toggleBold}>
          <strong>BOLD</strong>
        </button>

        <div>
          <span>COLOR: </span>
          <button
            onClick={() => setColor('red')}
            className="color-button red"
          >
            Red
          </button>
          <button
            onClick={() => setColor('blue')}
            className="color-button blue"
          >
            Blue
          </button>
          <button
            onClick={() => setColor('green')}
            className="color-button green"
          >
            Green
          </button>
          <button
            onClick={() => setColor('black')}
            className="color-button black"
          >
            Black
          </button>
        </div>
      </div>

      {/* Editor content area */}
      <div className="rich-text-editor-content">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default RichTextEditor;