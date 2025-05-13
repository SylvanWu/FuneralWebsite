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
  console.log("📥 初始传入 content 是：", content); // ✅ 这里加
  // Initialize the editor with necessary extensions
  const editor = useEditor({
    extensions: [StarterKit, TextStyle, Color, FontSize],  // Added FontSize extension here
    content,
    onUpdate({ editor }) {
      // onChange(editor.getHTML()); // Send updated content to parent
      const html = editor.getHTML();
      console.log("📝 用户编辑后新的 HTML：", html); // ✅ 这里加
      onChange(html);
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
      console.log("🔄 外部 content 改变了，重新写入编辑器：", content); // ✅ 这里加
      console.log("当前编辑器内容：", editor.getHTML());  // 打印编辑器当前内容
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
      {/* <div
        style={{
          flex: 1,
          padding: '8px',
          border: '1px solid #ccc',
          background: '#f9f9f9',
          whiteSpace: 'pre-wrap',
        }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div> */}
      {/* 右边的预览区域 */}
      {/* <div style={{ flex: 1 }}>
        <div className="dream-card">
          <div className="dream-list-content" dangerouslySetInnerHTML={{ __html: content }} />

        </div>

      </div> */}
    </div> // 👈 这一整块是 return 的完整包裹 div
  );
};

export default RichTextEditor;
