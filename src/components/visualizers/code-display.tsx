'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AlgorithmCode, CodeSnippet } from '@/algorithms/base';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

// ===========================================
// Types
// ===========================================

interface CodeDisplayProps {
  code: AlgorithmCode;
  language?: 'javascript' | 'python' | 'java' | 'cpp';
  highlightedLines?: number[];
  showLineNumbers?: boolean;
  className?: string;
}

// ===========================================
// Simple Syntax Highlighting
// ===========================================

const keywords = {
  javascript: ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return', 'break', 'continue', 'new', 'true', 'false', 'null', 'undefined', 'async', 'await'],
  python: ['def', 'if', 'else', 'elif', 'for', 'while', 'return', 'break', 'continue', 'True', 'False', 'None', 'and', 'or', 'not', 'in', 'is', 'from', 'import', 'class', 'range', 'len'],
  java: ['public', 'private', 'protected', 'class', 'void', 'int', 'boolean', 'if', 'else', 'for', 'while', 'return', 'break', 'continue', 'new', 'true', 'false', 'null', 'static'],
  cpp: ['int', 'void', 'bool', 'if', 'else', 'for', 'while', 'return', 'break', 'continue', 'new', 'true', 'false', 'nullptr', 'class', 'public', 'private', 'include'],
};

function highlightSyntax(code: string, language: string): React.ReactNode[] {
  const langKeywords = keywords[language as keyof typeof keywords] || keywords.javascript;
  const lines = code.split('\n');

  return lines.map((line, lineIndex) => {
    // Simple tokenization
    const tokens: React.ReactNode[] = [];
    let remaining = line;
    let tokenIndex = 0;

    while (remaining.length > 0) {
      // Check for comments
      const commentMatch = remaining.match(/^(\/\/.*|#.*)/);
      if (commentMatch) {
        tokens.push(
          <span key={`${lineIndex}-${tokenIndex++}`} className="text-gray-400 italic">
            {commentMatch[1]}
          </span>
        );
        remaining = remaining.slice(commentMatch[1].length);
        continue;
      }

      // Check for strings
      const stringMatch = remaining.match(/^("[^"]*"|'[^']*'|`[^`]*`)/);
      if (stringMatch) {
        tokens.push(
          <span key={`${lineIndex}-${tokenIndex++}`} className="text-emerald-600">
            {stringMatch[1]}
          </span>
        );
        remaining = remaining.slice(stringMatch[1].length);
        continue;
      }

      // Check for numbers
      const numberMatch = remaining.match(/^(\d+\.?\d*)/);
      if (numberMatch) {
        tokens.push(
          <span key={`${lineIndex}-${tokenIndex++}`} className="text-amber-600">
            {numberMatch[1]}
          </span>
        );
        remaining = remaining.slice(numberMatch[1].length);
        continue;
      }

      // Check for keywords
      const wordMatch = remaining.match(/^(\w+)/);
      if (wordMatch) {
        const word = wordMatch[1];
        if (langKeywords.includes(word)) {
          tokens.push(
            <span key={`${lineIndex}-${tokenIndex++}`} className="text-purple-600 font-medium">
              {word}
            </span>
          );
        } else {
          tokens.push(
            <span key={`${lineIndex}-${tokenIndex++}`} className="text-gray-800">
              {word}
            </span>
          );
        }
        remaining = remaining.slice(word.length);
        continue;
      }

      // Check for operators and symbols
      const symbolMatch = remaining.match(/^([+\-*/%=<>!&|^~?:;,.()\[\]{}]+)/);
      if (symbolMatch) {
        tokens.push(
          <span key={`${lineIndex}-${tokenIndex++}`} className="text-blue-600">
            {symbolMatch[1]}
          </span>
        );
        remaining = remaining.slice(symbolMatch[1].length);
        continue;
      }

      // Default: whitespace or unknown
      tokens.push(
        <span key={`${lineIndex}-${tokenIndex++}`}>
          {remaining[0]}
        </span>
      );
      remaining = remaining.slice(1);
    }

    return tokens;
  });
}

// ===========================================
// Code Display Component
// ===========================================

export function CodeDisplay({
  code,
  language = 'javascript',
  highlightedLines = [],
  showLineNumbers = true,
  className,
}: CodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const snippet = code[language] || code.javascript || Object.values(code)[0];
  
  if (!snippet) {
    return (
      <div className={cn('bg-gray-100 rounded-lg p-4 text-gray-400', className)}>
        No code available
      </div>
    );
  }

  const codeLines = snippet.code.split('\n');
  const highlightedCode = useMemo(() => 
    highlightSyntax(snippet.code, language),
    [snippet.code, language]
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={cn('relative rounded-xl overflow-hidden bg-gray-900', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-sm text-gray-400 ml-2 capitalize">{language}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code */}
      <div className="overflow-x-auto">
        <pre className="p-4 text-sm font-mono">
          {highlightedCode.map((lineTokens, index) => {
            const lineNumber = index + 1;
            const isHighlighted = highlightedLines.includes(lineNumber);

            return (
              <motion.div
                key={index}
                className={cn(
                  'flex',
                  isHighlighted && 'bg-yellow-500/20 -mx-4 px-4'
                )}
                animate={{
                  backgroundColor: isHighlighted 
                    ? 'rgba(234, 179, 8, 0.2)' 
                    : 'transparent',
                }}
                transition={{ duration: 0.2 }}
              >
                {showLineNumbers && (
                  <span className={cn(
                    'w-8 flex-shrink-0 text-right pr-4 select-none',
                    isHighlighted ? 'text-yellow-400' : 'text-gray-500'
                  )}>
                    {lineNumber}
                  </span>
                )}
                <code className="flex-1">
                  {lineTokens}
                </code>
              </motion.div>
            );
          })}
        </pre>
      </div>
    </div>
  );
}

// ===========================================
// Language Selector Component
// ===========================================

interface LanguageSelectorProps {
  availableLanguages: ('javascript' | 'python' | 'java' | 'cpp')[];
  selectedLanguage: string;
  onSelect: (language: 'javascript' | 'python' | 'java' | 'cpp') => void;
}

export function LanguageSelector({
  availableLanguages,
  selectedLanguage,
  onSelect,
}: LanguageSelectorProps) {
  const languageNames: Record<string, string> = {
    javascript: 'JavaScript',
    python: 'Python',
    java: 'Java',
    cpp: 'C++',
  };

  return (
    <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
      {availableLanguages.map((lang) => (
        <button
          key={lang}
          onClick={() => onSelect(lang)}
          className={cn(
            'px-3 py-1.5 text-sm rounded-md transition-all',
            selectedLanguage === lang
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          {languageNames[lang]}
        </button>
      ))}
    </div>
  );
}

// ===========================================
// Code Panel with Language Selector
// ===========================================

interface CodePanelProps {
  code: AlgorithmCode;
  highlightedLines?: number[];
  className?: string;
}

export function CodePanel({ code, highlightedLines = [], className }: CodePanelProps) {
  const availableLanguages = Object.keys(code).filter(
    (key) => code[key as keyof AlgorithmCode]
  ) as ('javascript' | 'python' | 'java' | 'cpp')[];

  const [selectedLanguage, setSelectedLanguage] = useState(availableLanguages[0] || 'javascript');

  return (
    <div className={cn('flex flex-col', className)}>
      {availableLanguages.length > 1 && (
        <div className="mb-3">
          <LanguageSelector
            availableLanguages={availableLanguages}
            selectedLanguage={selectedLanguage}
            onSelect={setSelectedLanguage}
          />
        </div>
      )}
      <CodeDisplay
        code={code}
        language={selectedLanguage}
        highlightedLines={highlightedLines}
        className="flex-1"
      />
    </div>
  );
}
