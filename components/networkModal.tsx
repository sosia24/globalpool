import React, { useState, useEffect } from "react";
import { fetchReferralNode } from "@/services/Web3Services";
import { IoMdArrowDropdown, IoMdArrowDropright } from "react-icons/io";
import { useLanguage } from "./LanguageManager";

interface ReferralNodeType {
  address: string | null;
  children?: ReferralNodeType[];
}

/**
 * Agora ajustado para tons de roxo.
 * O fundo fica mais claro/escuro conforme o nível.
 */
function getBackgroundColor(level: number): string {
  // Roxos mais profundos com leve variação por nível
  const baseRed = 70 + level * 10;
  const baseGreen = 30 + level * 5;
  const baseBlue = 120 + level * 10;

  const red = Math.min(baseRed, 160);
  const green = Math.min(baseGreen, 80);
  const blue = Math.min(baseBlue, 200);

  const opacity = 0.95;
  return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
}

interface ReferralNodeProps {
  node: ReferralNodeType;
  level?: number;
  onAddAffiliates?: (count: number) => void;
}

interface ReferralTreeProps {
  address: string;
}

const ReferralNode: React.FC<ReferralNodeProps> = ({
  node,
  level = 0,
  onAddAffiliates,
}) => {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [children, setChildren] = useState<ReferralNodeType[] | null>(
    node.children || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(!!node.children);

  const toggleExpand = async () => {
    const willExpand = !isExpanded;
    setIsExpanded(willExpand);

    if (!hasLoaded && node.address && willExpand) {
      try {
        setIsLoading(true);
        const newNode = await fetchReferralNode(node.address);
        const newChildren = newNode.children || [];
        setChildren(newChildren);
        setHasLoaded(true);
        onAddAffiliates?.(newChildren.length);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const backgroundColor = getBackgroundColor(level);
  const childrenCount = children?.length ?? 0;

  return (
    <div className="w-full flex flex-col mb-2">
      <div className="flex items-start group w-full cursor-pointer" onClick={toggleExpand}>
        
        {level > 0 && (
          <div className="hidden sm:block w-4 border-l-2 border-purple-500 h-full mr-2"></div>
        )}

        <div
          className="flex items-center px-3 py-2 rounded shadow-lg hover:shadow-purple-500/40 w-full transition-shadow duration-300"
          style={{ backgroundColor }}
        >
          <span className="bg-purple-700 text-white text-xs px-2 py-1 rounded-full mr-2 font-semibold">
            Level {level}
          </span>

          <span className="truncate text-gray-100 flex-1 min-w-0 text-sm sm:text-base font-mono">
            {node.address
              ? `${node.address.slice(0, 6)}...${node.address.slice(-4)}`
              : t.networkTreePage.noAddress}
          </span>

          <div className="bg-purple-400 text-sm text-gray-900 px-3 py-1 rounded-full ml-2 flex items-center font-bold hover:bg-purple-300 transition-colors duration-200">
            {isLoading
              ? "..."
              : hasLoaded
              ? childrenCount.toString()
              : "..."}{" "}
            {isExpanded ? <IoMdArrowDropdown /> : <IoMdArrowDropright />}
          </div>
        </div>
      </div>

      {isExpanded && children && (
        <div
          className={`flex flex-col mt-2 ${
            level > 0 ? "sm:pl-6 sm:ml-2 sm:border-l-2 sm:border-purple-500" : ""
          }`}
        >
          {children.map((child, index) => (
            <ReferralNode
              key={index}
              node={child}
              level={level + 1}
              onAddAffiliates={onAddAffiliates}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ReferralTree: React.FC<ReferralTreeProps> = ({ address }) => {
  const [tree, setTree] = useState<ReferralNodeType | null>(null);
  const [quantity, setQuantity] = useState(0);

  const addAffiliates = (count: number) => {
    setQuantity((prev) => prev + count);
  };
    async function loadInitialTree() {
      if (!address) return;

      try {
        const root = await fetchReferralNode(address);
        setTree(root);

        const directChildren = root.children?.length ?? 0;
        setQuantity(directChildren);
      } catch (error) {
        console.error(error);
      }
    }
  useEffect(() => {


    loadInitialTree();
  }, [address]);

  return (
    <div className="p-2 sm:p-4 bg-gray-900 rounded-2xl w-full sm:w-[96%] mx-auto overflow-x-auto border border-purple-500 shadow-purple-900/50 shadow-2xl">
      <div className="min-w-[300px]">
        
        <h1 className="text-3xl sm:text-xl font-bold text-center mb-6">
          <button className="bg-purple-500 shadow-lg shadow-purple-700/40 rounded-3xl w-[180px] h-[45px] font-bold text-[18px] text-gray-900 hover:bg-purple-400 transition-colors duration-300">
            Team
          </button>
        </h1>

        <h1 className="my-2 text-center sm:text-left text-purple-400 font-semibold text-lg">
          Number of affiliates: {quantity}
        </h1>

        {tree ? (
          <div className="flex flex-col w-full min-w-0 overflow-x-auto">
            <ReferralNode node={tree} onAddAffiliates={addAffiliates} />
          </div>
        ) : (
          <p className="text-center text-gray-400">Loading</p>
        )}
      </div>
    </div>
  );
};

export default ReferralTree;
