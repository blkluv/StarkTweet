import React, { useState, useEffect } from "react";
import { RpcProvider, Contract, shortString, num } from "starknet";
import axios from "axios";
import "./App.css";

const CONTRACT_ADDRESS = "0x01d2d2cd5ea6d0be0b305745768ae28273683200a5c93591dd332a8e863c5487";

const PINATA_API_KEY = "bc4d4e8362402c507084"; 
const PINATA_SECRET_API_KEY = "9340cd3ec48eb7222e9254f698ab501a6692c058b6e25f69d07a3c6b8b2e26e6";

const provider = new RpcProvider({
  nodeUrl: "https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_8/xu8recTcnFQYJFY0zvRJI",
});
 
const ABI = [
  {
    "name": "STK",
    "type": "impl",
    "interface_name": "backend::StarkTweet::STKTWT"
  },
  {
    "name": "core::bool",
    "type": "enum",
    "variants": [
      {
        "name": "False",
        "type": "()"
      },
      {
        "name": "True",
        "type": "()"
      }
    ]
  },
  {
    "name": "backend::StarkTweet::STKTWT",
    "type": "interface",
    "items": [
      {
        "name": "user_profile",
        "type": "function",
        "inputs": [
          {
            "name": "name",
            "type": "core::felt252"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "name": "create_tweet",
        "type": "function",
        "inputs": [
          {
            "name": "tweet",
            "type": "core::felt252"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "name": "get_name",
        "type": "function",
        "inputs": [
          {
            "name": "addr",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::felt252"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "get_tweets",
        "type": "function",
        "inputs": [
          {
            "name": "addr",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::array::Array::<core::felt252>"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "get_all_tweets",
        "type": "function",
        "inputs": [
          {
            "name": "start_idx",
            "type": "core::integer::u32"
          },
          {
            "name": "limit",
            "type": "core::integer::u32"
          }
        ],
        "outputs": [
          {
            "type": "core::array::Array::<(core::starknet::contract_address::ContractAddress, core::felt252)>"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "get_global_tweet_count",
        "type": "function",
        "inputs": [],
        "outputs": [
          {
            "type": "core::integer::u32"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "create_tweet_with_media",
        "type": "function",
        "inputs": [
          {
            "name": "tweet",
            "type": "core::felt252"
          },
          {
            "name": "media_uri",
            "type": "core::felt252"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "name": "like_tweet",
        "type": "function",
        "inputs": [
          {
            "name": "tweet_id",
            "type": "core::integer::u32"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "name": "get_tweet_likes",
        "type": "function",
        "inputs": [
          {
            "name": "tweet_id",
            "type": "core::integer::u32"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u32"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "set_profile_picture",
        "type": "function",
        "inputs": [
          {
            "name": "profile_pic_uri",
            "type": "core::felt252"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "name": "get_profile_picture",
        "type": "function",
        "inputs": [
          {
            "name": "addr",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::felt252"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "get_has_liked_tweet",
        "type": "function",
        "inputs": [
          {
            "name": "user",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "tweet_id",
            "type": "core::integer::u32"
          }
        ],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "get_tweet_with_media",
        "type": "function",
        "inputs": [
          {
            "name": "tweet_id",
            "type": "core::integer::u32"
          }
        ],
        "outputs": [
          {
            "type": "(core::starknet::contract_address::ContractAddress, core::felt252, core::felt252, core::integer::u32)"
          }
        ],
        "state_mutability": "view"
      }
    ]
  },
  {
    "name": "ERC721MixinImpl",
    "type": "impl",
    "interface_name": "openzeppelin_token::erc721::interface::ERC721ABI"
  },
  {
    "name": "core::integer::u256",
    "type": "struct",
    "members": [
      {
        "name": "low",
        "type": "core::integer::u128"
      },
      {
        "name": "high",
        "type": "core::integer::u128"
      }
    ]
  },
  {
    "name": "core::array::Span::<core::felt252>",
    "type": "struct",
    "members": [
      {
        "name": "snapshot",
        "type": "@core::array::Array::<core::felt252>"
      }
    ]
  },
  {
    "name": "core::byte_array::ByteArray",
    "type": "struct",
    "members": [
      {
        "name": "data",
        "type": "core::array::Array::<core::bytes_31::bytes31>"
      },
      {
        "name": "pending_word",
        "type": "core::felt252"
      },
      {
        "name": "pending_word_len",
        "type": "core::integer::u32"
      }
    ]
  },
  {
    "name": "openzeppelin_token::erc721::interface::ERC721ABI",
    "type": "interface",
    "items": [
      {
        "name": "balance_of",
        "type": "function",
        "inputs": [
          {
            "name": "account",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "owner_of",
        "type": "function",
        "inputs": [
          {
            "name": "token_id",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [
          {
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "safe_transfer_from",
        "type": "function",
        "inputs": [
          {
            "name": "from",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "to",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "token_id",
            "type": "core::integer::u256"
          },
          {
            "name": "data",
            "type": "core::array::Span::<core::felt252>"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "name": "transfer_from",
        "type": "function",
        "inputs": [
          {
            "name": "from",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "to",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "token_id",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "name": "approve",
        "type": "function",
        "inputs": [
          {
            "name": "to",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "token_id",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "name": "set_approval_for_all",
        "type": "function",
        "inputs": [
          {
            "name": "operator",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "approved",
            "type": "core::bool"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "name": "get_approved",
        "type": "function",
        "inputs": [
          {
            "name": "token_id",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [
          {
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "is_approved_for_all",
        "type": "function",
        "inputs": [
          {
            "name": "owner",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "operator",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "supports_interface",
        "type": "function",
        "inputs": [
          {
            "name": "interface_id",
            "type": "core::felt252"
          }
        ],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "name",
        "type": "function",
        "inputs": [],
        "outputs": [
          {
            "type": "core::byte_array::ByteArray"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "symbol",
        "type": "function",
        "inputs": [],
        "outputs": [
          {
            "type": "core::byte_array::ByteArray"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "token_uri",
        "type": "function",
        "inputs": [
          {
            "name": "token_id",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [
          {
            "type": "core::byte_array::ByteArray"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "balanceOf",
        "type": "function",
        "inputs": [
          {
            "name": "account",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "ownerOf",
        "type": "function",
        "inputs": [
          {
            "name": "tokenId",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [
          {
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "safeTransferFrom",
        "type": "function",
        "inputs": [
          {
            "name": "from",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "to",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "tokenId",
            "type": "core::integer::u256"
          },
          {
            "name": "data",
            "type": "core::array::Span::<core::felt252>"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "name": "transferFrom",
        "type": "function",
        "inputs": [
          {
            "name": "from",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "to",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "tokenId",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "name": "setApprovalForAll",
        "type": "function",
        "inputs": [
          {
            "name": "operator",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "approved",
            "type": "core::bool"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "name": "getApproved",
        "type": "function",
        "inputs": [
          {
            "name": "tokenId",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [
          {
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "isApprovedForAll",
        "type": "function",
        "inputs": [
          {
            "name": "owner",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "operator",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "tokenURI",
        "type": "function",
        "inputs": [
          {
            "name": "tokenId",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [
          {
            "type": "core::byte_array::ByteArray"
          }
        ],
        "state_mutability": "view"
      }
    ]
  },
  {
    "name": "constructor",
    "type": "constructor",
    "inputs": []
  },
  {
    "kind": "struct",
    "name": "openzeppelin_token::erc721::erc721::ERC721Component::Transfer",
    "type": "event",
    "members": [
      {
        "kind": "key",
        "name": "from",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "kind": "key",
        "name": "to",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "kind": "key",
        "name": "token_id",
        "type": "core::integer::u256"
      }
    ]
  },
  {
    "kind": "struct",
    "name": "openzeppelin_token::erc721::erc721::ERC721Component::Approval",
    "type": "event",
    "members": [
      {
        "kind": "key",
        "name": "owner",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "kind": "key",
        "name": "approved",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "kind": "key",
        "name": "token_id",
        "type": "core::integer::u256"
      }
    ]
  },
  {
    "kind": "struct",
    "name": "openzeppelin_token::erc721::erc721::ERC721Component::ApprovalForAll",
    "type": "event",
    "members": [
      {
        "kind": "key",
        "name": "owner",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "kind": "key",
        "name": "operator",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "kind": "data",
        "name": "approved",
        "type": "core::bool"
      }
    ]
  },
  {
    "kind": "enum",
    "name": "openzeppelin_token::erc721::erc721::ERC721Component::Event",
    "type": "event",
    "variants": [
      {
        "kind": "nested",
        "name": "Transfer",
        "type": "openzeppelin_token::erc721::erc721::ERC721Component::Transfer"
      },
      {
        "kind": "nested",
        "name": "Approval",
        "type": "openzeppelin_token::erc721::erc721::ERC721Component::Approval"
      },
      {
        "kind": "nested",
        "name": "ApprovalForAll",
        "type": "openzeppelin_token::erc721::erc721::ERC721Component::ApprovalForAll"
      }
    ]
  },
  {
    "kind": "enum",
    "name": "openzeppelin_introspection::src5::SRC5Component::Event",
    "type": "event",
    "variants": []
  },
  {
    "kind": "struct",
    "name": "backend::StarkTweet::StarkTweet::TweetCreated",
    "type": "event",
    "members": [
      {
        "kind": "data",
        "name": "author",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "kind": "data",
        "name": "tweet_id",
        "type": "core::integer::u32"
      },
      {
        "kind": "data",
        "name": "content",
        "type": "core::felt252"
      }
    ]
  },
  {
    "kind": "struct",
    "name": "backend::StarkTweet::StarkTweet::MediaTweetCreated",
    "type": "event",
    "members": [
      {
        "kind": "data",
        "name": "author",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "kind": "data",
        "name": "tweet_id",
        "type": "core::integer::u32"
      },
      {
        "kind": "data",
        "name": "content",
        "type": "core::felt252"
      },
      {
        "kind": "data",
        "name": "media_uri",
        "type": "core::felt252"
      },
      {
        "kind": "data",
        "name": "token_id",
        "type": "core::integer::u256"
      }
    ]
  },
  {
    "kind": "struct",
    "name": "backend::StarkTweet::StarkTweet::TweetLiked",
    "type": "event",
    "members": [
      {
        "kind": "data",
        "name": "user",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "kind": "data",
        "name": "tweet_id",
        "type": "core::integer::u32"
      },
      {
        "kind": "data",
        "name": "new_like_count",
        "type": "core::integer::u32"
      }
    ]
  },
  {
    "kind": "struct",
    "name": "backend::StarkTweet::StarkTweet::ProfilePictureSet",
    "type": "event",
    "members": [
      {
        "kind": "data",
        "name": "user",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "kind": "data",
        "name": "profile_pic_uri",
        "type": "core::felt252"
      },
      {
        "kind": "data",
        "name": "token_id",
        "type": "core::integer::u256"
      }
    ]
  },
  {
    "kind": "enum",
    "name": "backend::StarkTweet::StarkTweet::Event",
    "type": "event",
    "variants": [
      {
        "kind": "flat",
        "name": "ERC721Event",
        "type": "openzeppelin_token::erc721::erc721::ERC721Component::Event"
      },
      {
        "kind": "flat",
        "name": "SRC5Event",
        "type": "openzeppelin_introspection::src5::SRC5Component::Event"
      },
      {
        "kind": "nested",
        "name": "TweetCreated",
        "type": "backend::StarkTweet::StarkTweet::TweetCreated"
      },
      {
        "kind": "nested",
        "name": "MediaTweetCreated",
        "type": "backend::StarkTweet::StarkTweet::MediaTweetCreated"
      },
      {
        "kind": "nested",
        "name": "TweetLiked",
        "type": "backend::StarkTweet::StarkTweet::TweetLiked"
      },
      {
        "kind": "nested",
        "name": "ProfilePictureSet",
        "type": "backend::StarkTweet::StarkTweet::ProfilePictureSet"
      }
    ]
  }
]; 

const safeStringify = (obj) => {
  return JSON.stringify(obj, (key, value) => 
    typeof value === 'bigint' ? value.toString() : value
  );
};

function App() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [accountAddress, setAccountAddress] = useState("");
  const [username, setUsername] = useState("");
  const [tweetContent, setTweetContent] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [userProfile, setUserProfile] = useState({
    name: "",
    profilePic: ""
  });
  const [contract, setContract] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [starknetAccount, setStarknetAccount] = useState(null); 
  const [mediaFileName, setMediaFileName] = useState("");
  const [profilePicFileName, setProfilePicFileName] = useState("");
  const [userProfiles, setUserProfiles] = useState({}); // Cache for user profiles

  const [debugLog, setDebugLog] = useState([]);
  
  const addDebugLog = (message) => {
    console.log(message);
    setDebugLog(prev => [...prev, { time: new Date().toISOString(), message }]);
  };

  const showNotification = (message, type = "error") => {
    setError(message);
    setNotification({ message, type });
    
    setTimeout(() => {
      setError("");
      setNotification({ message: "", type: "" });
    }, 5000);
  };

  const fixIpfsUrl = (url) => {
    if (!url) return "";
    
    if (url.startsWith("https://")) {
      // Check if it's the truncated URL ending with just '/ipfs'
      if (url === "https://gateway.pinata.cloud/ipfs" || url === "https://gateway.pinata.cloud/ip") {
        return ""; // Invalid URL, return empty
      }
      
      if (url === "https://gateway.pinata.cloud/") {
        return "";
      }
      
      return url;
    }
    
    if (url.startsWith("Qm")) {
      return `https://gateway.pinata.cloud/ipfs/${url}`;
    }
    
    return url;
  };

  const safeLocalStorageSave = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      addDebugLog(`Error saving to localStorage: ${error.message}`);
      return false;
    }
  };

  const safeLocalStorageGet = (key, defaultValue = {}) => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : defaultValue;
    } catch (error) {
      addDebugLog(`Error reading from localStorage: ${error.message}`);
      return defaultValue;
    }
  };

  const connectWallet = async () => {
    if (!window.starknet) {
      showNotification("Please install a StarkNet wallet like Argent X or Braavos");
      return;
    }
    
    try {
      setIsLoading(true);
      
      await window.starknet.enable();
      
      const starkAccount = window.starknet.account;
      
      if (!starkAccount || !starkAccount.address) {
        throw new Error("No account selected in wallet");
      }

      const viewOnlyContract = new Contract(ABI, CONTRACT_ADDRESS, provider);
      
      try {
        addDebugLog("Testing contract calls with address: " + starkAccount.address);
        const accounts = await viewOnlyContract.get_name(starkAccount.address);
        addDebugLog("Account name result: " + safeStringify(accounts));
        
        const tweetCount = await viewOnlyContract.get_global_tweet_count();
        addDebugLog("Tweet count result: " + safeStringify(tweetCount));
      } catch (testError) {
        addDebugLog("Contract test call error: " + (testError.message || JSON.stringify(testError)));
      }
      
      const contractInstance = new Contract(ABI, CONTRACT_ADDRESS, starkAccount);
      
      setContract(contractInstance);
      setWalletConnected(true);
      setAccountAddress(starkAccount.address);
      setStarknetAccount(starkAccount); 
      
      await fetchUserProfile(starkAccount.address, true);
      
      addDebugLog("Wallet connected: " + starkAccount.address);
      showNotification("Wallet connected successfully!", "success");
    } catch (err) {
      addDebugLog("Wallet connection failed: " + (err.message || JSON.stringify(err)));
      showNotification("Failed to connect wallet: " + (err.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  const uploadToPinata = async (file) => {
    try {
      setIsLoading(true);
      addDebugLog("Starting file upload to Pinata");
      
      const formData = new FormData();
      formData.append("file", file);
      
      const metadata = JSON.stringify({
        name: `StarkTweet-${Date.now()}`,
      });
      formData.append('pinataMetadata', metadata);
      
      const options = JSON.stringify({
        cidVersion: 0,
      });
      formData.append('pinataOptions', options);
      
      addDebugLog("Sending request to Pinata API");
      const res = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          maxBodyLength: "Infinity",
          headers: {
            'Content-Type': `multipart/form-data;`,
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_API_KEY,
          },
        }
      );
      
      addDebugLog("File uploaded to Pinata: " + safeStringify(res.data));
      
      const ipfsUri = `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
      addDebugLog("Complete IPFS URI: " + ipfsUri);
      
      return ipfsUri;
    } catch (error) {
      addDebugLog("Error uploading to Pinata: " + (error.message || JSON.stringify(error)));
      if (error.response) {
        addDebugLog("Pinata response error: " + safeStringify(error.response.data));
      }
      throw new Error("Failed to upload file to Pinata: " + (error.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  
  const likeTweet = async (tweetId) => {
    if (!walletConnected) {
      showNotification("Please connect wallet");
      return;
    }
    
    try {
      setIsLoading(true);
      
      const tweetIdBN = num.toBigInt(tweetId);
      
      if (!contract) {
        throw new Error("Contract not initialized");
      }
      
      addDebugLog("Liking tweet ID: " + tweetId);
      try {
        const tx = await contract.like_tweet(tweetIdBN);
        addDebugLog("Like tweet transaction submitted: " + safeStringify(tx));
        
        await provider.waitForTransaction(tx.transaction_hash);
        addDebugLog("Like tweet transaction confirmed");
      } catch (txError) {
        addDebugLog("Like tweet transaction failed: " + (txError.message || JSON.stringify(txError)));
        throw new Error("Like tweet transaction failed: " + (txError.message || "Transaction error"));
      }
      
      await fetchAllTweets();
      
      showNotification("Tweet liked successfully!", "success");
    } catch (err) {
      addDebugLog("Like tweet failed: " + (err.message || JSON.stringify(err)));
      if (err.message && err.message.includes("Already liked this tweet")) {
        showNotification("You've already liked this tweet");
      } else {
        showNotification("Failed to like tweet: " + (err.message || "Unknown error"));
      }
    } finally {
      setIsLoading(false);
    }
  };


  const fetchAllTweets = async () => {
    try {
      setIsLoading(true);
      
      const viewOnlyContract = new Contract(ABI, CONTRACT_ADDRESS, provider);
      
      addDebugLog("Fetching all tweets...");
      
      try {
        const tweetCountResponse = await viewOnlyContract.get_global_tweet_count();
        addDebugLog("Tweet count response: " + safeStringify(tweetCountResponse));
        
        if (!tweetCountResponse) {
          addDebugLog("No tweet count returned");
          setTweets([]);
          return;
        }
        
        const tweetCount = Number(tweetCountResponse.toString());
        addDebugLog("Total tweets: " + tweetCount);
        
        if (tweetCount === 0) {
          setTweets([]);
          return;
        }
        
        const totalTweets = Math.min(tweetCount, 1000);
        let allTweets = [];
        
        try {
          addDebugLog(`Fetching tweets: offset=0, limit=${totalTweets}`);
          
          const tweetBatchResponse = await viewOnlyContract.get_all_tweets(0, totalTweets);
          addDebugLog("Tweet batch response received with length: " + tweetBatchResponse.length);
          
          if (!tweetBatchResponse || tweetBatchResponse.length === 0) {
            addDebugLog("No tweets in batch");
            setTweets([]);
            return;
          }
          
          for (let j = 0; j < tweetBatchResponse.length; j++) {
            const tweetId = j;
            const tweetData = tweetBatchResponse[j];
            
            if (!tweetData || tweetData.length < 2) {
              addDebugLog(`Skipping invalid tweet data at index ${j}`);
              continue;
            }
            
            const authorAddress = tweetData[0].toString();
            let tweetContent = "";
            
            try {
              if (tweetData[1] && tweetData[1].toString() !== '0') {
                tweetContent = shortString.decodeShortString(tweetData[1]);
              }
            } catch (decodeError) {
              addDebugLog(`Error decoding tweet ${tweetId}: ${decodeError.message || JSON.stringify(decodeError)}`);
              tweetContent = "[Decode Error]";
            }
            
            const tweet = {
              id: tweetId,
              author: {
                address: authorAddress,
                name: "",
                profilePic: "https://via.placeholder.com/40?text=User" // Default placeholder
              },
              content: tweetContent,
              mediaUri: "",
              likes: 0,
              hasLiked: false
            };
            
            try {
              // Get tweet with media details
              const mediaTweetResponse = await viewOnlyContract.get_tweet_with_media(tweetId);
              
              if (mediaTweetResponse && mediaTweetResponse.length >= 4) {
                let mediaUri = "";
                try {
                  const mediaUriFelt = mediaTweetResponse[2];
                  if (mediaUriFelt && mediaUriFelt.toString() !== '0') {
                    const rawUri = shortString.decodeShortString(mediaUriFelt);
                    // Use our helper function to get the complete URI
                    mediaUri = getMediaUrl(tweetId, rawUri);
                    
                    // Log the media URI to debug
                    addDebugLog(`Media URI for tweet ${tweetId}: ${mediaUri}`);
                  }
                } catch (mediaDecodeError) {
                  addDebugLog(`Error decoding media URI for tweet ${tweetId}: ${mediaDecodeError.message || JSON.stringify(mediaDecodeError)}`);
                }
                
                tweet.mediaUri = mediaUri;
                tweet.likes = parseInt(mediaTweetResponse[3].toString() || '0');
              } else {
                // If not a media tweet, get likes separately
                const likesResponse = await viewOnlyContract.get_tweet_likes(tweetId);
                if (likesResponse) {
                  tweet.likes = parseInt(likesResponse.toString() || '0');
                }
              }
              
              // Check if current user has liked this tweet
              if (walletConnected && accountAddress) {
                try {
                  const hasLikedResponse = await viewOnlyContract.get_has_liked_tweet(
                    accountAddress, 
                    tweetId
                  );
                  
                  if (hasLikedResponse !== undefined) {
                    tweet.hasLiked = Boolean(parseInt(hasLikedResponse.toString() || '0'));
                  }
                } catch (hasLikedError) {
                  addDebugLog(`Error checking like status for tweet ${tweetId}: ${hasLikedError.message || JSON.stringify(hasLikedError)}`);
                  // Continue even if this fails
                }
              }
            } catch (tweetDetailError) {
              addDebugLog(`Error fetching details for tweet ${tweetId}: ${tweetDetailError.message || JSON.stringify(tweetDetailError)}`);
              // Continue even if media detail fetching fails
            }
            
            // Fetch author profile information - use cache if available
            try {
              const authorProfile = await fetchUserProfile(authorAddress);
              tweet.author.name = authorProfile.name;
              tweet.author.profilePic = authorProfile.profilePic;
            } catch (profileError) {
              addDebugLog(`Error fetching profile for tweet ${tweetId} author: ${profileError.message || JSON.stringify(profileError)}`);
              // Continue even if profile fetching fails
            }
            
            // Add to tweets array
            allTweets.push(tweet);
          }
        } catch (fetchError) {
         addDebugLog(`Error in main tweet fetching: ${fetchError.message || JSON.stringify(fetchError)}`);
          throw fetchError;
        }
        
        // Sort tweets by ID in descending order (newest first)
        allTweets.sort((a, b) => b.id - a.id);
        
        addDebugLog(`Total tweets fetched: ${allTweets.length}`);
        setTweets(allTweets);
      } catch (countError) {
        addDebugLog("Error fetching tweet count: " + (countError.message || JSON.stringify(countError)));
        throw countError;
      }
    } catch (err) {
      addDebugLog("Failed to fetch tweets: " + (err.message || JSON.stringify(err)));
      showNotification("Failed to fetch tweets: " + (err.message || "Unknown error"));
      setTweets([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle media file selection
  const handleMediaFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setMediaFile(file);
      setMediaFileName(file.name);
    }
  };

  // Handle profile picture selection
  const handleProfilePicChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setProfilePicture(file);
      setProfilePicFileName(file.name);
    }
  };

  // Clear selected media file
  const clearMediaFile = () => {
    setMediaFile(null);
    setMediaFileName("");
  };

  // Clear selected profile picture
  const clearProfilePicture = () => {
    setProfilePicture(null);
    setProfilePicFileName("");
  };

  // Handle tweet content change
  const handleTweetContentChange = (event) => {
    // Truncate to 31 characters (cairo string limit)
    setTweetContent(event.target.value);
  };

  // Handle username change
  const handleUsernameChange = (event) => {
    // Truncate to 31 characters (cairo string limit)
    setUsername(event.target.value);
  };

  // Effect to connect wallet on page load if previously connected
  useEffect(() => {
    // Check localStorage for previously connected wallet
    const checkPreviousConnection = async () => {
      try {
        if (window.starknet && window.starknet.isConnected) {
          connectWallet();
        }
      } catch (error) {
        console.error("Error checking previous connection:", error);
      }
    };
    
    checkPreviousConnection();
  }, []);

  // Effect to fetch tweets on wallet connection
  useEffect(() => {
    if (walletConnected) {
      fetchAllTweets();
    }
  }, [walletConnected]);

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return "";
    if (address.length <= 10) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Fix for empty profile pictures and media: Implement proper URL checking
  const isValidUrl = (url) => {
    if (!url) return false;
    
    // Check if it's an empty or incomplete URL
    if (url === "https://gateway.pinata.cloud/ipfs" || 
        url === "https://gateway.pinata.cloud/ip" ||
        url === "https://gateway.pinata.cloud/") {
      return false;
    }
    
    // Check if it's a properly formed URL
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // FIX: Better storage keys for media and profile pictures
  const getTweetMediaKey = (tweetId) => `tweet_media_${tweetId}`;
  const getProfilePicKey = (address) => `profile_pic_${address}`;

  // FIX: Enhanced method to get media URL with proper validation
  const getMediaUrl = (tweetId, contractMediaUri) => {
    try {
      // Try to get from localStorage first with consistent key format
      const userMediaMap = safeLocalStorageGet('starktweet_media_map', {});
      const storageKey = getTweetMediaKey(tweetId);
      
      if (userMediaMap[storageKey] && isValidUrl(userMediaMap[storageKey])) {
        addDebugLog(`Found valid media URL in localStorage for tweet ${tweetId}: ${userMediaMap[storageKey]}`);
        return userMediaMap[storageKey];
      }
      
      // If localStorage doesn't have a valid URL, check the contract URI
      const fixedUrl = fixIpfsUrl(contractMediaUri);
      if (isValidUrl(fixedUrl)) {
        // Store this URL in localStorage for future reference
        const updatedMap = {...userMediaMap};
        updatedMap[storageKey] = fixedUrl;
        safeLocalStorageSave('starktweet_media_map', updatedMap);
        
        return fixedUrl;
      }
    } catch (error) {
      addDebugLog("Error processing media URL: " + error.message);
    }
    
    return ""; // Return empty string if no valid URL found
  };

  // FIX: Enhanced method to get profile picture URL with proper validation
  const getProfilePicUrl = (address, contractProfilePic) => {
    try {
      // Try to get from localStorage first with consistent key format
      const userMediaMap = safeLocalStorageGet('starktweet_media_map', {});
      const storageKey = getProfilePicKey(address);
      
      if (userMediaMap[storageKey] && isValidUrl(userMediaMap[storageKey])) {
        addDebugLog(`Found valid profile pic in localStorage for ${address}: ${userMediaMap[storageKey]}`);
        return userMediaMap[storageKey];
      }
      
      // If localStorage doesn't have a valid URL, check the contract URI
      const fixedUrl = fixIpfsUrl(contractProfilePic);
      if (isValidUrl(fixedUrl)) {
        // Store this URL in localStorage for future reference
        const updatedMap = {...userMediaMap};
        updatedMap[storageKey] = fixedUrl;
        safeLocalStorageSave('starktweet_media_map', updatedMap);
        
        return fixedUrl;
      }
    } catch (error) {
      addDebugLog("Error processing profile pic URL: " + error.message);
    }
    
    // Use default image for missing profile pic
    return "https://via.placeholder.com/40?text=User";
  };

  // FIX: Helper function to save profile pic immediately to localStorage
  const saveProfilePicToLocalStorage = (address, picUrl) => {
    if (!address || !isValidUrl(picUrl)) return false;
    
    try {
      const userMediaMap = safeLocalStorageGet('starktweet_media_map', {});
      userMediaMap[getProfilePicKey(address)] = picUrl;
      return safeLocalStorageSave('starktweet_media_map', userMediaMap);
    } catch (error) {
      addDebugLog(`Error saving profile pic to localStorage: ${error.message}`);
      return false;
    }
  };

  // FIX: Helper function to save tweet media immediately to localStorage
  const saveTweetMediaToLocalStorage = (tweetId, mediaUrl) => {
    if (tweetId === null || !isValidUrl(mediaUrl)) return false;
    
    try {
      const userMediaMap = safeLocalStorageGet('starktweet_media_map', {});
      userMediaMap[getTweetMediaKey(tweetId)] = mediaUrl;
      return safeLocalStorageSave('starktweet_media_map', userMediaMap);
    } catch (error) {
      addDebugLog(`Error saving tweet media to localStorage: ${error.message}`);
      return false;
    }
  };

  // FIX: Modified updateUserProfile function to ensure profile pics are saved properly
  const updateUserProfile = async () => {
    if (!walletConnected || !username) {
      showNotification("Please connect wallet and set a username");
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Convert username to felt - limit to 31 characters for short string
      const truncatedUsername = username.substring(0, 31);
      const usernameAsFelt = shortString.encodeShortString(truncatedUsername);
      
      // Call contract to update username
      if (!contract) {
        throw new Error("Contract not initialized");
      }
      
      addDebugLog("Updating profile with username: " + truncatedUsername);
      try {
        const tx = await contract.user_profile(usernameAsFelt);
        addDebugLog("Profile update transaction submitted: " + safeStringify(tx));
        
        addDebugLog("Waiting for transaction confirmation...");
        await provider.waitForTransaction(tx.transaction_hash);
        addDebugLog("Profile update transaction confirmed");
        
        // FIX: Update local state immediately after successful username update
        setUserProfile(prev => ({
          ...prev,
          name: truncatedUsername
        }));
        
        // FIX: Update cached profiles
        setUserProfiles(prev => ({
          ...prev,
          [accountAddress]: {
            ...prev[accountAddress],
            name: truncatedUsername
          }
        }));
      } catch (txError) {
        addDebugLog("Profile update transaction failed: " + (txError.message || JSON.stringify(txError)));
        throw new Error("Profile update transaction failed: " + (txError.message || "Transaction error"));
      }
      
      // Upload profile picture if selected
      if (profilePicture) {
        try {
          addDebugLog("Uploading profile picture to Pinata");
          const profilePicUri = await uploadToPinata(profilePicture);
          
          if (profilePicUri && isValidUrl(profilePicUri)) {
            addDebugLog("Profile picture URI: " + profilePicUri);
            
            // FIX: Save full profile pic URL to localStorage BEFORE transaction
            saveProfilePicToLocalStorage(accountAddress, profilePicUri);
            
            // Use shortened URI for contract (Cairo limitation)
            const shortenedUri = profilePicUri.substring(0, 31);
            const profilePicAsFelt = shortString.encodeShortString(shortenedUri);
            
            addDebugLog("Setting profile picture with shortened URI: " + shortenedUri);
            // Call contract to set profile picture
            const picTx = await contract.set_profile_picture(profilePicAsFelt);
            addDebugLog("Profile picture transaction submitted: " + safeStringify(picTx));
            
            await provider.waitForTransaction(picTx.transaction_hash);
            addDebugLog("Profile picture transaction confirmed");

            // FIX: Update userProfile state to reflect the new profile picture immediately
            setUserProfile(prev => ({
              ...prev,
              profilePic: profilePicUri
            }));
            
            // FIX: Update cached profiles
            setUserProfiles(prev => ({
              ...prev,
              [accountAddress]: {
                ...prev[accountAddress],
                profilePic: profilePicUri
              }
            }));
          }
        } catch (uploadError) {
          addDebugLog("Failed to upload profile picture: " + (uploadError.message || JSON.stringify(uploadError)));
          showNotification("Profile updated but image upload failed: " + (uploadError.message || "Unknown error"));
        } finally {
          // Clear the file input
          setProfilePicture(null);
          setProfilePicFileName("");
        }
      }
      
      // FIX: Only refresh user profile if no errors occurred
      await fetchUserProfile(accountAddress, true);
      
      showNotification("Profile updated successfully!", "success");
    } catch (err) {
      addDebugLog("Profile update failed: " + (err.message || JSON.stringify(err)));
      showNotification("Failed to update profile: " + (err.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  // FIX: Modified createTweet function to properly handle media storage
  const createTweet = async () => {
    if (!walletConnected || !tweetContent) {
      showNotification("Please connect wallet and enter tweet content");
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Convert tweet content to felt - limit to 31 characters for short string
      const truncatedTweet = tweetContent.substring(0, 31);
      const tweetAsFelt = shortString.encodeShortString(truncatedTweet);
      
      if (!contract) {
        throw new Error("Contract not initialized");
      }
      
      let tx;
      let fullMediaUri = null;
      let newTweetId = null;
      
      // First get the current tweet count to know the ID of our new tweet
      try {
        const viewOnlyContract = new Contract(ABI, CONTRACT_ADDRESS, provider);
        const tweetCountResponse = await viewOnlyContract.get_global_tweet_count();
        newTweetId = Number(tweetCountResponse.toString());
        addDebugLog(`Current tweet count: ${newTweetId}, new tweet will have ID: ${newTweetId}`);
      } catch (countError) {
        addDebugLog("Error getting tweet count: " + (countError.message || JSON.stringify(countError)));
        // Continue anyway, we'll try to get the ID later
      }
      
      if (mediaFile) {
        try {
          // Upload media file to Pinata
          addDebugLog("Uploading media to Pinata");
          const mediaUri = await uploadToPinata(mediaFile);
          
          if (mediaUri && isValidUrl(mediaUri)) {
            fullMediaUri = mediaUri; // Store the full URL
            
            // FIX: Save media URL to localStorage BEFORE transaction if we know the tweet ID
            if (newTweetId !== null) {
              saveTweetMediaToLocalStorage(newTweetId, fullMediaUri);
            }
            
            // Use shortened URI for contract
            addDebugLog("Media URI: " + mediaUri);
            const shortenedUri = mediaUri.substring(0, 31);
            const mediaUriAsFelt = shortString.encodeShortString(shortenedUri);
            
            addDebugLog("Creating tweet with media using shortened URI: " + shortenedUri);
            // Create tweet with media
            tx = await contract.create_tweet_with_media(tweetAsFelt, mediaUriAsFelt);
            addDebugLog("Media tweet transaction submitted: " + safeStringify(tx));
            
            await provider.waitForTransaction(tx.transaction_hash);
            addDebugLog("Media tweet transaction confirmed");
            
            // FIX: If we couldn't get the tweet ID before, try again now
            if (newTweetId === null) {
              try {
                const viewOnlyContract = new Contract(ABI, CONTRACT_ADDRESS, provider);
                const tweetCountResponse = await viewOnlyContract.get_global_tweet_count();
                // Since tweet IDs are zero-based, the ID is count - 1
                newTweetId = Number(tweetCountResponse.toString()) - 1;
                addDebugLog(`Got tweet ID after posting: ${newTweetId}`);
                
                // Now save the media URL with the correct ID
                if (newTweetId !== null) {
                  saveTweetMediaToLocalStorage(newTweetId, fullMediaUri);
                }
              } catch (idError) {
                addDebugLog("Error getting tweet ID after posting: " + idError.message);
              }
            }
          }
        } catch (uploadError) {
          addDebugLog("Failed to upload media: " + (uploadError.message || JSON.stringify(uploadError)));
          showNotification("Media upload failed, creating tweet without media");
          
          // Fallback to normal tweet if media upload fails
          tx = await contract.create_tweet(tweetAsFelt);
          addDebugLog("Regular tweet transaction submitted: " + safeStringify(tx));
          
          await provider.waitForTransaction(tx.transaction_hash);
          addDebugLog("Regular tweet transaction confirmed");
        } finally {
          // Clear the file input
          setMediaFile(null);
          setMediaFileName("");
        }
      } else {
        // Create regular tweet
        addDebugLog("Creating regular tweet");
        tx = await contract.create_tweet(tweetAsFelt);
        addDebugLog("Tweet transaction submitted: " + safeStringify(tx));
        
        await provider.waitForTransaction(tx.transaction_hash);
        addDebugLog("Tweet transaction confirmed");
      }
      
      // Reset form
      setTweetContent("");
      
      // FIX: Wait a moment before refreshing tweets to allow blockchain state to update
      setTimeout(async () => {
        await fetchAllTweets();
      }, 2000);
      
      showNotification("Tweet created successfully!", "success");
    } catch (err) {
      addDebugLog("Tweet creation failed: " + (err.message || JSON.stringify(err)));
      showNotification("Failed to create tweet: " + (err.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  // FIX: Modified fetchUserProfile to handle caching correctly
  const fetchUserProfile = async (address, forceRefresh = false) => {
    try {
      if (!address) return { name: "", profilePic: "" };
      
      // Check if we already have this profile cached and not forcing refresh
      if (!forceRefresh && userProfiles[address]) {
        addDebugLog("Using cached profile for: " + address);
        // If this is the current user, update state
        if (address === accountAddress) {
          setUserProfile(userProfiles[address]);
          if (userProfiles[address].name && !username) {
            setUsername(userProfiles[address].name);
          }
        }
        return userProfiles[address];
      }
      
      // Create a read-only contract instance
      const viewOnlyContract = new Contract(ABI, CONTRACT_ADDRESS, provider);
      
      // Debug logging
      addDebugLog("Fetching profile for address: " + address);
      
      try {
        // Get user name
        const nameResponse = await viewOnlyContract.get_name(address);
        addDebugLog("Name response: " + safeStringify(nameResponse));
        
        // Get user profile picture
        const profilePicResponse = await viewOnlyContract.get_profile_picture(address);
        addDebugLog("Profile pic response: " + safeStringify(profilePicResponse));
        
        // Process name
        let nameStr = "";
        if (nameResponse && nameResponse.toString() !== '0') {
          try {
            nameStr = shortString.decodeShortString(nameResponse);
          } catch (decodeError) {
            addDebugLog("Error decoding name: " + (decodeError.message || JSON.stringify(decodeError)));
          }
        }
        
        // Process profile pic - FIX: Use enhanced getProfilePicUrl method
        let profilePicUri = "";
        if (profilePicResponse && profilePicResponse.toString() !== '0') {
          try {
            let rawUri = shortString.decodeShortString(profilePicResponse);
            profilePicUri = getProfilePicUrl(address, rawUri);
          } catch (decodeError) {
            addDebugLog("Error decoding profile pic: " + (decodeError.message || JSON.stringify(decodeError)));
          }
        }
        
        // If profilePicUri is empty, use a placeholder
        if (!profilePicUri) {
          profilePicUri = "https://via.placeholder.com/40?text=User";
        }
        
        const profile = { name: nameStr, profilePic: profilePicUri };
        addDebugLog("Fetched profile: " + safeStringify(profile));
        
        // Update cached profiles
        setUserProfiles(prev => ({
          ...prev,
          [address]: profile
        }));
        
        // Update state if it's the current user
        if (address === accountAddress) {
          setUserProfile(profile);
          if (nameStr && !username) {
            setUsername(nameStr);
          }
        }
        
        return profile;
      } catch (callError) {
        addDebugLog("Contract call error: " + (callError.message || JSON.stringify(callError)));
        throw callError;
      }
    } catch (err) {
      addDebugLog("Failed to fetch user profile: " + (err.message || JSON.stringify(err)));
      // Return a default profile with placeholder image on error
      return { 
        name: "", 
        profilePic: "https://via.placeholder.com/40?text=User" 
      };
    }
  };

  // UI Rendering
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="container mx-auto px-4 py-8">
        <header className="bg-white shadow-md rounded-lg p-4 mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">XO</h1>
          {walletConnected ? (
            <div className="flex items-center">
              <div className="mr-3 text-sm">
                <div className="font-bold">{userProfile?.name || "Anonymous"}</div>
                <div className="text-gray-500">{formatAddress(accountAddress)}</div>
              </div>
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img 
                  src={userProfile?.profilePic || "https://via.placeholder.com/40?text=User"} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/40?text=User";
                  }}
                />
              </div>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded shadow"
            >
              {isLoading ? "Connecting..." : "Connect Wallet"}
            </button>
          )}
        </header>
        
        {notification.message && (
          <div className={`mb-4 p-3 rounded-lg ${notification.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {notification.message}
          </div>
        )}
        
        {walletConnected && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <div className="bg-white shadow-md rounded-lg p-5 mb-6">
                <h2 className="text-xl font-bold mb-4">Profile</h2>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={handleUsernameChange}
                    placeholder="Enter your username"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    maxLength={31}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Profile Picture
                  </label>
                  <div className="flex items-center space-x-2">
                    <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded text-sm">
                      Choose File
                      <input
                        type="file"
                        onChange={handleProfilePicChange}
                        className="hidden"
                        accept="image/*"
                      />
                    </label>
                    {profilePicFileName && (
                      <>
                        <span className="text-sm text-gray-600 truncate flex-1">{profilePicFileName}</span>
                        <button
                          onClick={clearProfilePicture}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={updateUserProfile}
                  disabled={isLoading}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded shadow w-full"
                >
                  {isLoading ? "Updating..." : "Update Profile"}
                </button>
              </div>
              
              <div className="bg-white shadow-md rounded-lg p-5">
                <h2 className="text-xl font-bold mb-4">Create XO</h2>
                <div className="mb-4">
                  <textarea
                    value={tweetContent}
                    onChange={handleTweetContentChange}
                    placeholder="What's happening?"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    rows={3}
                    maxLength={31}
                  ></textarea>
                  <div className="text-right text-xs text-gray-500">
                    {tweetContent.length}/31 characters
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Add Media
                  </label>
                  <div className="flex items-center space-x-2">
                    <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded text-sm">
                      Choose File
                      <input
                        type="file"
                        onChange={handleMediaFileChange}
                        className="hidden"
                        accept="image/*"
                      />
                    </label>
                    {mediaFileName && (
                      <>
                        <span className="text-sm text-gray-600 truncate flex-1">{mediaFileName}</span>
                        <button
                          onClick={clearMediaFile}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={createTweet}
                  disabled={isLoading || !tweetContent}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-bold py-2 px-4 rounded shadow w-full"
                >
                  {isLoading ? "Posting..." : "Post Tweet"}
                </button>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <div className="bg-white shadow-md rounded-lg p-5">
                <h2 className="text-xl font-bold mb-4">XOS</h2>
                {isLoading && tweets.length === 0 ? (
                  <div className="text-center py-4">Loading XOS...</div>
                ) : tweets.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">No XOS yet. Be the first to post!</div>
                ) : (
                  <div className="space-y-4">
                    {tweets.map((tweet) => (
                      <div key={tweet.id} className="border-b border-gray-200 pb-4">
                        <div className="flex items-start mb-2">
                          <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                            <img 
                              src={tweet.author.profilePic} 
                              alt="Profile" 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://via.placeholder.com/40?text=User";
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center">
                              <div className="font-bold mr-2">{tweet.author.name || "Anonymous"}</div>
                              <div className="text-sm text-gray-500">{formatAddress(tweet.author.address)}</div>
                            </div>
                            <div className="my-2">{tweet.content}</div>
                            {tweet.mediaUri && (
                              <div className="my-2 rounded overflow-hidden max-h-96">
                                <img 
                                  src={tweet.mediaUri} 
                                  alt="Tweet media" 
                                  className="w-full object-contain"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                            <div className="mt-2 flex items-center">
                              <button
                                onClick={() => likeTweet(tweet.id)}
                                disabled={isLoading || tweet.hasLiked}
                                className={`flex items-center ${
                                  tweet.hasLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                                }`}
                              >
                                <span className="mr-1">❤️</span>
                                <span>{tweet.likes}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Debug Panel (hidden in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 bg-gray-800 text-white p-4 rounded-lg">
            <h3 className="text-lg font-bold mb-2">Debug Log</h3>
            <div className="overflow-auto max-h-40 text-xs">
              {debugLog.map((log, index) => (
                <div key={index} className="pb-1">
                  <span className="text-gray-400">{log.time}: </span>
                  {log.message}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;