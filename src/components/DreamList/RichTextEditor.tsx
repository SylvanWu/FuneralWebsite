import React, { useEffect } from 'react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/core/src/extensions/text-style';
import Color from '@tiptap/core/src/extensions/color';
import FontSize from '@tiptap/core/src/extensions/font-size';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [StarterKit, TextStyle, Color, FontSize],
    content,
    onUpdate({ editor }) {
      const html = editor.getHTML();
      onChange(html);
    },
  });

  const setColor = (color: string) => {
    editor?.commands.setMark('textStyle', { color });
  };

  const toggleBold = () => {
    editor?.commands.toggleBold();
  };

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div>
      {/* Render your editor components here */}
    </div>
  );
};

export default RichTextEditor; 