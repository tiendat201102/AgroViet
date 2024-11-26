"use client";
import React, { useState, useEffect } from 'react';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState } from 'draft-js';

const DraftEditor = ({ editorState, onEditorStateChange, ...props }) => {
    const [mounted, setMounted] = useState(false);
    const [localEditorState, setLocalEditorState] = useState(null);

    useEffect(() => {
        setMounted(true);
        setLocalEditorState(editorState || EditorState.createEmpty());
    }, [editorState]);

    const handleEditorStateChange = (newState) => {
        if (mounted) {
            setLocalEditorState(newState);
            if (onEditorStateChange) {
                onEditorStateChange(newState);
            }
        }
    };

    if (!mounted || !localEditorState) {
        return <div>Loading editor...</div>;
    }

    const toolbar = {
        options: ['inline', 'list', 'textAlign', 'history'],
        
        
        inline: {
            options: ['bold', 'italic', 'underline', 'strikethrough', 'monospace', 'superscript', 'subscript'],
        },
        blockType: {
            options: ['Normal', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'Blockquote', 'Code'],
        },
        fontSize: {
            options: [8, 9, 10, 11, 12, 14, 16, 18, 24, 30, 36, 48],
        },
        fontFamily: {
            options: ['Arial', 'Georgia', 'Impact', 'Tahoma', 'Times New Roman', 'Verdana'],
        },
        list: {
            options: ['unordered', 'ordered', 'indent', 'outdent'],
        },
        textAlign: {
            options: ['left', 'center', 'right', 'justify'],
        },
        colorPicker: {
            colors: ['rgb(97,189,109)', 'rgb(26,188,156)', 'rgb(84,172,210)', 'rgb(44,130,201)',
                'rgb(147,101,184)', 'rgb(71,85,119)', 'rgb(204,204,204)', 'rgb(65,168,95)', 
                'rgb(0,168,133)', 'rgb(61,142,185)', 'rgb(41,105,176)', 'rgb(85,57,130)', 
                'rgb(40,50,78)', 'rgb(0,0,0)', 'rgb(247,218,100)', 'rgb(251,160,38)'],
        },
        link: {
            showOpenOptionOnHover: true,
            defaultTargetOption: '_self',
            options: ['link', 'unlink'],
        },
        emoji: {
            emojis: [
                '😀', '😁', '😂', '😃', '😉', '😋', '😎', '😍', '😗', '🤗', '🤔', 
                '😣', '😫', '😴', '😌', '🤓', '😛', '😜', '😠', '😇', '😷', '😈', 
                '👻', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '🙈', '🙉', '🙊'
            ],
        },
        image: {
            urlEnabled: true,
            uploadEnabled: true,
            alignmentEnabled: true,
            previewImage: false,
            inputAccept: 'image/gif,image/jpeg,image/jpg,image/png,image/svg',
            defaultSize: {
                height: 'auto',
                width: 'auto',
            },
        }
    };

    return (
        <Editor
            editorState={localEditorState}
            onEditorStateChange={handleEditorStateChange}
            toolbar={toolbar}
            {...props}
        />
    );
};

export default DraftEditor;