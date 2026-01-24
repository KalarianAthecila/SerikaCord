"use client";

import { useState, useEffect } from "react";
import { Search, Clock, Smile, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import twemoji from "twemoji";

interface CustomEmoji {
  id: string;
  name: string;
  url: string;
  serverId?: string;
  serverName?: string;
  animated?: boolean;
}

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string, isCustom?: boolean, emojiData?: CustomEmoji) => void;
  serverEmojis?: CustomEmoji[];
  recentEmojis?: string[];
  className?: string;
}

const EMOJI_CATEGORIES = {
  "😀 Smileys & Emotion": [
    "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃", "😉", "😊",
    "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😙", "😋", "😛", "😜", "🤪",
    "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐", "🤨", "😐", "😑", "😶", "😏",
    "😒", "🙄", "😬", "🤥", "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕",
    "🤢", "🤮", "🤧", "🥵", "🥶", "🥴", "😵", "🤯", "🤠", "🥳", "😎", "🤓",
    "🧐", "😕", "😟", "🙁", "😮", "😯", "😲", "😳", "🥺", "😦", "😧", "😨",
    "😰", "😥", "😢", "😭", "😱", "😖", "😣", "😞", "😓", "😩", "😫", "🥱"
  ],
  "👋 People & Body": [
    "👋", "🤚", "🖐️", "✋", "🖖", "👌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙",
    "👈", "👉", "👆", "🖕", "👇", "☝️", "👍", "👎", "✊", "👊", "🤛", "🤜",
    "👏", "🙌", "👐", "🤲", "🤝", "🙏", "✍️", "💅", "🤳", "💪", "🦾", "🦿",
    "🦵", "🦶", "👂", "🦻", "👃", "🧠", "🦷", "🦴", "👀", "👁️", "👅", "👄"
  ],
  "🐶 Animals & Nature": [
    "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮",
    "🐷", "🐸", "🐵", "🐔", "🐧", "🐦", "🐤", "🦆", "🦅", "🦉", "🦇", "🐺",
    "🐗", "🐴", "🦄", "🐝", "🐛", "🦋", "🐌", "🐞", "🐜", "🦟", "🦗", "🕷️",
    "🦂", "🐢", "🐍", "🦎", "🦖", "🦕", "🐙", "🦑", "🦐", "🦞", "🦀", "🐡",
    "🐠", "🐟", "🐬", "🐳", "🐋", "🦈", "🐊", "🐅", "🐆", "🦓", "🦍", "🦧"
  ],
  "🍔 Food & Drink": [
    "🍏", "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍈", "🍒", "🍑",
    "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥬", "🥒", "🌶️", "🌽",
    "🥕", "🥔", "🍠", "🥐", "🥯", "🍞", "🥖", "🥨", "🧀", "🥚", "🍳", "🧈",
    "🥞", "🧇", "🥓", "🥩", "🍗", "🍖", "🦴", "🌭", "🍔", "🍟", "🍕", "🥪",
    "🥙", "🧆", "🌮", "🌯", "🥗", "🥘", "🍝", "🍜", "🍲", "🍛", "🍣", "🍱"
  ],
  "⚽ Activities": [
    "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱", "🪀", "🏓",
    "🏸", "🏒", "🏑", "🥍", "🏏", "🥅", "⛳", "🪁", "🏹", "🎣", "🤿", "🥊",
    "🥋", "🎽", "🛹", "🛼", "🛷", "⛸️", "🥌", "🎿", "⛷️", "🏂", "🪂", "🏋️",
    "🤼", "🤸", "🤺", "⛹️", "🤾", "🏌️", "🏇", "🧘", "🏄", "🏊", "🤽", "🚣"
  ],
  "✈️ Travel & Places": [
    "🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐", "🚚", "🚛",
    "🚜", "🦯", "🦽", "🦼", "🛴", "🚲", "🛵", "🏍️", "🛺", "🚨", "🚔", "🚍",
    "🚘", "🚖", "🚡", "🚠", "🚟", "🚃", "🚋", "🚞", "🚝", "🚄", "🚅", "🚈",
    "🚂", "🚆", "🚇", "🚊", "🚉", "✈️", "🛫", "🛬", "🛩️", "💺", "🛰️", "🚀"
  ],
  "💡 Objects": [
    "⌚", "📱", "📲", "💻", "⌨️", "🖥️", "🖨️", "🖱️", "🖲️", "🕹️", "🗜️", "💽",
    "💾", "💿", "📀", "📼", "📷", "📸", "📹", "🎥", "📽️", "🎞️", "📞", "☎️",
    "📟", "📠", "📺", "📻", "🎙️", "🎚️", "🎛️", "🧭", "⏱️", "⏲️", "⏰", "🕰️",
    "⌛", "⏳", "📡", "🔋", "🔌", "💡", "🔦", "🕯️", "🪔", "🧯", "🛢️", "💸"
  ],
  "❤️ Symbols": [
    "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕",
    "💞", "💓", "💗", "💖", "💘", "💝", "💟", "☮️", "✝️", "☪️", "🕉️", "☸️",
    "✡️", "🔯", "🕎", "☯️", "☦️", "🛐", "⛎", "♈", "♉", "♊", "♋", "♌",
    "♍", "♎", "♏", "♐", "♑", "♒", "♓", "🆔", "⚛️", "🉑", "☢️", "☣️"
  ],
  "🏁 Flags": [
    "🏁", "🚩", "🎌", "🏴", "🏳️", "🏳️‍🌈", "🏳️‍⚧️", "🏴‍☠️", "🇺🇳", "🇦🇫", "🇦🇽", "🇦🇱"
  ]
};

export function CustomEmojiPicker({
  onEmojiSelect,
  serverEmojis = [],
  recentEmojis = [],
  className,
}: EmojiPickerProps) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState(recentEmojis.length > 0 ? "recent" : "smileys");

  const filteredStandardEmojis = Object.entries(EMOJI_CATEGORIES).reduce((acc, [category, emojis]) => {
    if (!search) {
      acc[category] = emojis;
      return acc;
    }
    const filtered = emojis.filter(emoji => {
      const codePoint = emoji.codePointAt(0)?.toString(16);
      return codePoint && twemoji.convert.toCodePoint(emoji).includes(search.toLowerCase());
    });
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {} as Record<string, string[]>);

  const filteredServerEmojis = serverEmojis.filter(emoji =>
    emoji.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleEmojiClick = (emoji: string, isCustom = false, emojiData?: CustomEmoji) => {
    onEmojiSelect(emoji, isCustom, emojiData);
  };

  return (
    <div className={cn("w-[352px] h-[435px] bg-[#111111] rounded-lg border border-[#222222] flex flex-col", className)}>
      {/* Search */}
      <div className="p-3 border-b border-[#222222]">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search emojis"
            className="pl-8 bg-[#0a0a0a] border-[#333333] text-white placeholder:text-[#666666] h-8"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="w-full bg-transparent border-b border-[#222222] rounded-none p-0 h-auto">
          {recentEmojis.length > 0 && (
            <TabsTrigger
              value="recent"
              className="flex-1 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#8B5CF6] rounded-none py-2"
            >
              <Clock className="w-4 h-4" />
            </TabsTrigger>
          )}
          <TabsTrigger
            value="smileys"
            className="flex-1 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#8B5CF6] rounded-none py-2"
          >
            😀
          </TabsTrigger>
          <TabsTrigger
            value="people"
            className="flex-1 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#8B5CF6] rounded-none py-2"
          >
            👋
          </TabsTrigger>
          <TabsTrigger
            value="animals"
            className="flex-1 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#8B5CF6] rounded-none py-2"
          >
            🐶
          </TabsTrigger>
          <TabsTrigger
            value="food"
            className="flex-1 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#8B5CF6] rounded-none py-2"
          >
            🍔
          </TabsTrigger>
          {serverEmojis.length > 0 && (
            <TabsTrigger
              value="server"
              className="flex-1 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#8B5CF6] rounded-none py-2"
            >
              <Users className="w-4 h-4" />
            </TabsTrigger>
          )}
        </TabsList>

        <ScrollArea className="flex-1">
          {/* Recent */}
          {recentEmojis.length > 0 && (
            <TabsContent value="recent" className="p-3 m-0">
              <div className="grid grid-cols-9 gap-1">
                {recentEmojis.slice(0, 27).map((emoji, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleEmojiClick(emoji)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-[#222222] rounded text-2xl transition-colors"
                    dangerouslySetInnerHTML={{
                      __html: twemoji.parse(emoji, { folder: "svg", ext: ".svg" })
                    }}
                  />
                ))}
              </div>
            </TabsContent>
          )}

          {/* Standard Emoji Categories */}
          <TabsContent value="smileys" className="p-3 m-0">
            {Object.entries(filteredStandardEmojis).slice(0, 1).map(([category, emojis]) => (
              <div key={category} className="mb-4">
                <h3 className="text-xs font-semibold text-[#888888] mb-2">{category}</h3>
                <div className="grid grid-cols-9 gap-1">
                  {emojis.map((emoji, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleEmojiClick(emoji)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-[#222222] rounded text-2xl transition-colors"
                      dangerouslySetInnerHTML={{
                        __html: twemoji.parse(emoji, { folder: "svg", ext: ".svg" })
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="people" className="p-3 m-0">
            {Object.entries(filteredStandardEmojis).slice(1, 2).map(([category, emojis]) => (
              <div key={category} className="mb-4">
                <h3 className="text-xs font-semibold text-[#888888] mb-2">{category}</h3>
                <div className="grid grid-cols-9 gap-1">
                  {emojis.map((emoji, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleEmojiClick(emoji)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-[#222222] rounded text-2xl transition-colors"
                      dangerouslySetInnerHTML={{
                        __html: twemoji.parse(emoji, { folder: "svg", ext: ".svg" })
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="animals" className="p-3 m-0">
            {Object.entries(filteredStandardEmojis).slice(2, 3).map(([category, emojis]) => (
              <div key={category} className="mb-4">
                <h3 className="text-xs font-semibold text-[#888888] mb-2">{category}</h3>
                <div className="grid grid-cols-9 gap-1">
                  {emojis.map((emoji, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleEmojiClick(emoji)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-[#222222] rounded text-2xl transition-colors"
                      dangerouslySetInnerHTML={{
                        __html: twemoji.parse(emoji, { folder: "svg", ext: ".svg" })
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="food" className="p-3 m-0">
            {Object.entries(filteredStandardEmojis).slice(3, 4).map(([category, emojis]) => (
              <div key={category} className="mb-4">
                <h3 className="text-xs font-semibold text-[#888888] mb-2">{category}</h3>
                <div className="grid grid-cols-9 gap-1">
                  {emojis.map((emoji, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleEmojiClick(emoji)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-[#222222] rounded text-2xl transition-colors"
                      dangerouslySetInnerHTML={{
                        __html: twemoji.parse(emoji, { folder: "svg", ext: ".svg" })
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Server Emojis */}
          {serverEmojis.length > 0 && (
            <TabsContent value="server" className="p-3 m-0">
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-[#888888] mb-2">Server Emojis</h3>
                <div className="grid grid-cols-9 gap-1">
                  {filteredServerEmojis.map((emoji) => (
                    <button
                      key={emoji.id}
                      onClick={() => handleEmojiClick(`:${emoji.name}:`, true, emoji)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-[#222222] rounded transition-colors p-1"
                      title={`:${emoji.name}:`}
                    >
                      <img
                        src={emoji.url}
                        alt={emoji.name}
                        className="w-full h-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>
          )}
        </ScrollArea>
      </Tabs>
    </div>
  );
}
