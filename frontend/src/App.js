import React, { useState, useEffect } from "react";
import { RpcProvider, Contract, shortString, num } from "starknet";
import axios from "axios";
import "./App.css";

// Starknet Contract Information
const CONTRACT_ADDRESS = "0x028ab9c5a093624cd7e55958b4dd324c905f010a76167c349b5bc602f9662862";

// Replace these with your Pinata API keys
const PINATA_API_KEY = "bc4d4e8362402c507084"; 
const PINATA_SECRET_API_KEY = "9340cd3ec48eb7222e9254f698ab501a6692c058b6e25f69d07a3c6b8b2e26e6";

// Starknet Provider Configuration
const provider = new RpcProvider({
  nodeUrl: "https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_8/FCyLgvgy4q9oa_OScl33IgtjRYHNr1gP",
});
 
// ABI - You'll fill this in with your ABI
const ABI =[
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
] ; // Your ABI goes here

// Helper to safely stringify BigInt values
const safeStringify = (obj) => {
  return JSON.stringify(obj, (key, value) => 
    typeof value === 'bigint' ? value.toString() : value
  );
};

function App() {
  // State variables
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

  // Debug
  const [debugLog, setDebugLog] = useState([]);
  
  // Add debug logging function
  const addDebugLog = (message) => {
    console.log(message);
    setDebugLog(prev => [...prev, { time: new Date().toISOString(), message }]);
  };

  // Show notification helper
  const showNotification = (message, type = "error") => {
    setError(message);
    setNotification({ message, type });
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setError("");
      setNotification({ message: "", type: "" });
    }, 5000);
  };

  // Helper function to fix IPFS URLs
  const fixIpfsUrl = (url) => {
    if (!url) return "";
    
    // If it's already a complete URL with https://, return it
    if (url.startsWith("https://")) {
      // Check if it's a truncated URL (gateway.pinata.cloud/ip)
      if (url.endsWith("/ip")) {
        // Add the missing fs part
        return url + "fs";
      }
      return url;
    }
    
    // If it's just an IPFS hash (starts with Qm)
    if (url.startsWith("Qm")) {
      return `https://gateway.pinata.cloud/ipfs/${url}`;
    }
    
    // If none of the above, return the original
    return url;
  };

  // Connect wallet function
  const connectWallet = async () => {
    if (!window.starknet) {
      showNotification("Please install a StarkNet wallet like Argent X or Braavos");
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Enable the wallet
      await window.starknet.enable();
      
      // Get the account directly from starknet
      const starkAccount = window.starknet.account;
      
      if (!starkAccount || !starkAccount.address) {
        throw new Error("No account selected in wallet");
      }

      // Create a read-only contract for testing
      const viewOnlyContract = new Contract(ABI, CONTRACT_ADDRESS, provider);
      
      try {
        // Test contract calls with proper error handling
        addDebugLog("Testing contract calls with address: " + starkAccount.address);
        const accounts = await viewOnlyContract.get_name(starkAccount.address);
        addDebugLog("Account name result: " + safeStringify(accounts));
        
        // Test tweet fetching
        const tweetCount = await viewOnlyContract.get_global_tweet_count();
        addDebugLog("Tweet count result: " + safeStringify(tweetCount));
      } catch (testError) {
        addDebugLog("Contract test call error: " + (testError.message || JSON.stringify(testError)));
      }
      
      // Create a contract instance with the connected account
      const contractInstance = new Contract(ABI, CONTRACT_ADDRESS, starkAccount);
      
      setContract(contractInstance);
      setWalletConnected(true);
      setAccountAddress(starkAccount.address);
      setStarknetAccount(starkAccount); // Save the account object
      
      // Load user profile after connecting
      await fetchUserProfile(starkAccount.address);
      
      addDebugLog("Wallet connected: " + starkAccount.address);
      showNotification("Wallet connected successfully!", "success");
    } catch (err) {
      addDebugLog("Wallet connection failed: " + (err.message || JSON.stringify(err)));
      showNotification("Failed to connect wallet: " + (err.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  // Upload file to Pinata
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
      
      // Make sure we get a complete IPFS URI
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

  // Set user profile
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
      } catch (txError) {
        addDebugLog("Profile update transaction failed: " + (txError.message || JSON.stringify(txError)));
        throw new Error("Profile update transaction failed: " + (txError.message || "Transaction error"));
      }
      
      // Upload profile picture if selected
      if (profilePicture) {
        try {
          addDebugLog("Uploading profile picture to Pinata");
          const profilePicUri = await uploadToPinata(profilePicture);
          if (profilePicUri) {
            addDebugLog("Profile picture URI: " + profilePicUri);
            
            // Store the complete URL but use a shortened version for the contract
            // This is a limitation of the felt type in Cairo
            const shortenedUri = profilePicUri.substring(0, 31);
            const profilePicAsFelt = shortString.encodeShortString(shortenedUri);
            
            addDebugLog("Setting profile picture with shortened URI: " + shortenedUri);
            // Call contract to set profile picture
            const picTx = await contract.set_profile_picture(profilePicAsFelt);
            addDebugLog("Profile picture transaction submitted: " + safeStringify(picTx));
            
            await provider.waitForTransaction(picTx.transaction_hash);
            addDebugLog("Profile picture transaction confirmed");

            // Save full URL to local storage for retrieval
            try {
              const userMediaMap = JSON.parse(localStorage.getItem('starktweet_media_map') || '{}');
              userMediaMap[accountAddress + '_profile'] = profilePicUri;
              localStorage.setItem('starktweet_media_map', JSON.stringify(userMediaMap));
              addDebugLog("Saved full profile pic URL to local storage");
            } catch (storageError) {
              addDebugLog("Could not save to localStorage: " + storageError.message);
            }
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
      
      // Refresh user profile
      await fetchUserProfile(accountAddress);
      
      showNotification("Profile updated successfully!", "success");
    } catch (err) {
      addDebugLog("Profile update failed: " + (err.message || JSON.stringify(err)));
      showNotification("Failed to update profile: " + (err.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  // Create tweet
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
      
      if (mediaFile) {
        try {
          // Upload media file to Pinata
          addDebugLog("Uploading media to Pinata");
          const mediaUri = await uploadToPinata(mediaFile);
          
          if (mediaUri) {
            fullMediaUri = mediaUri; // Store the full URL
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
            
            // Store the full media URL in localStorage
            try {
              const tweetCount = await contract.get_global_tweet_count();
              const tweetId = Number(tweetCount) - 1; // The tweet we just created should be the last one
              
              const userMediaMap = JSON.parse(localStorage.getItem('starktweet_media_map') || '{}');
              userMediaMap[`tweet_${tweetId}`] = fullMediaUri;
              localStorage.setItem('starktweet_media_map', JSON.stringify(userMediaMap));
              addDebugLog(`Saved full media URL for tweet ${tweetId} to local storage`);
            } catch (storageError) {
              addDebugLog("Could not save media to localStorage: " + storageError.message);
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
      
      // Refresh tweets
      await fetchAllTweets();
      
      showNotification("Tweet created successfully!", "success");
    } catch (err) {
      addDebugLog("Tweet creation failed: " + (err.message || JSON.stringify(err)));
      showNotification("Failed to create tweet: " + (err.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  // Like a tweet
  const likeTweet = async (tweetId) => {
    if (!walletConnected) {
      showNotification("Please connect wallet");
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Convert tweetId to uint256 format for contract
      const tweetIdBN = num.toBigInt(tweetId);
      
      if (!contract) {
        throw new Error("Contract not initialized");
      }
      
      // Call contract to like tweet
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
      
      // Refresh tweets
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

  // Get media URL from localStorage or fix the fetched one
  const getMediaUrl = (tweetId, contractMediaUri) => {
    try {
      // Try to get from localStorage first
      const userMediaMap = JSON.parse(localStorage.getItem('starktweet_media_map') || '{}');
      if (userMediaMap[`tweet_${tweetId}`]) {
        return userMediaMap[`tweet_${tweetId}`];
      }
    } catch (error) {
      addDebugLog("Error reading from localStorage: " + error.message);
    }
    
    // Otherwise use the contract one but fix it
    return fixIpfsUrl(contractMediaUri);
  };

  // Get profile picture URL
  const getProfilePicUrl = (address, contractProfilePic) => {
    try {
      // Try to get from localStorage first
      const userMediaMap = JSON.parse(localStorage.getItem('starktweet_media_map') || '{}');
      if (userMediaMap[address + '_profile']) {
        return userMediaMap[address + '_profile'];
      }
    } catch (error) {
      addDebugLog("Error reading profile pic from localStorage: " + error.message);
    }
    
    // Otherwise use the contract one but fix it
    return fixIpfsUrl(contractProfilePic);
  };

  // Fetch user profile
  const fetchUserProfile = async (address) => {
    try {
      if (!address) return { name: "", profilePic: "" };
      
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
        
        // Process profile pic
        let profilePicUri = "";
        if (profilePicResponse && profilePicResponse.toString() !== '0') {
          try {
            let rawUri = shortString.decodeShortString(profilePicResponse);
            profilePicUri = getProfilePicUrl(address, rawUri);
          } catch (decodeError) {
            addDebugLog("Error decoding profile pic: " + (decodeError.message || JSON.stringify(decodeError)));
          }
        }
        
        const profile = { name: nameStr, profilePic: profilePicUri };
        addDebugLog("Fetched profile: " + safeStringify(profile));
        
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
      return { name: "", profilePic: "" };
    }
  };

  // Fetch all tweets
  const fetchAllTweets = async () => {
    try {
      setIsLoading(true);
      
      // Create a read-only contract instance
      const viewOnlyContract = new Contract(ABI, CONTRACT_ADDRESS, provider);
      
      addDebugLog("Fetching all tweets...");
      
      // Get total tweet count
      try {
        const tweetCountResponse = await viewOnlyContract.get_global_tweet_count();
        addDebugLog("Tweet count response: " + safeStringify(tweetCountResponse));
        
        // Check if response exists and is valid
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
        
        // Fetch tweets in batches (e.g., 10 at a time)
        const batchSize = 100; // Reduced for better stability
        const totalTweets = Math.min(tweetCount, 1000); // Limit to 1000 for performance
        let allTweets = [];
        
        // Fetch tweets in batches
        try {
          // Get all tweets - using simpler call pattern
          addDebugLog(`Fetching tweets: offset=0, limit=${totalTweets}`);
          
          const tweetBatchResponse = await viewOnlyContract.get_all_tweets(0, totalTweets);
          addDebugLog("Tweet batch response received with length: " + tweetBatchResponse.length);
          
          if (!tweetBatchResponse || tweetBatchResponse.length === 0) {
            addDebugLog("No tweets in batch");
            setTweets([]);
            return;
          }
          
          // Process each tweet
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
              // Only decode if the value is not zero
              if (tweetData[1] && tweetData[1].toString() !== '0') {
                tweetContent = shortString.decodeShortString(tweetData[1]);
              }
            } catch (decodeError) {
              addDebugLog(`Error decoding tweet ${tweetId}: ${decodeError.message || JSON.stringify(decodeError)}`);
              tweetContent = "[Decode Error]";
            }
            
            // Initialize tweet object
            const tweet = {
              id: tweetId,
              author: {
                address: authorAddress,
                name: "",
                profilePic: ""
              },
              content: tweetContent,
              mediaUri: "",
              likes: 0,
              hasLiked: false
            };
            
            // Check if it's a media tweet
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
            
            // Fetch author profile information
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
        
        // Sort tweets newest first
        allTweets.sort((a, b) => b.id - a.id);
        addDebugLog(`Total tweets fetched: ${allTweets.length}`);
        
        setTweets(allTweets);
      } catch (countError) {
        addDebugLog("Error fetching tweet count: " + (countError.message || JSON.stringify(countError)));
        throw countError;
      }
    } catch (err) {
      addDebugLog("Failed to fetch tweets: " + (err.message || JSON.stringify(err)));
      showNotification("Failed to load tweets: " + (err.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch tweets when wallet connects
  useEffect(() => {
    if (walletConnected) {
      fetchAllTweets();
    }
  }, [walletConnected]);

  // Check if wallet is already connected on component mount
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.starknet && window.starknet.isConnected) {
        try {
          await connectWallet();
        } catch (error) {
          addDebugLog("Error reconnecting wallet: " + (error.message || JSON.stringify(error)));
        }
      }
    };
    
    checkWalletConnection();
  }, []);

  // Handle media file selection
  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (file.size > maxSize) {
      showNotification("File size should not exceed 5MB");
      return;
    }
    
    if (!file.type.startsWith("image/")) {
      showNotification("Only image files are supported");
      return;
    }
    
    if (fileType === "media") {
      setMediaFile(file);
      setMediaFileName(file.name);
    } else if (fileType === "profilePic") {
      setProfilePicture(file);
      setProfilePicFileName(file.name);
    }
  };

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return "";
    // Handle address as string (it might be BigInt before)
    address = address.toString(); 
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
  <div className="starktweet-app">
    <header className="app-header">
      <h1>StarkTweet</h1>
      {!walletConnected ? (
        <button onClick={connectWallet} className="connect-button" disabled={isLoading}>
          {isLoading ? "Connecting..." : "Connect Wallet"}
        </button>
      ) : (
        <div className="user-info">
          <span>{userProfile.name || formatAddress(accountAddress)}</span>
          {userProfile.profilePic && (
            <img 
              src={userProfile.profilePic} 
              alt="Profile" 
              className="profile-pic-small" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/40?text=Error";
              }}
            />
          )}
        </div>
      )}
    </header>

    {walletConnected && (
      <div className="app-content">
        <div className="profile-section">
          <h2>Your Profile</h2>
          <div className="profile-form">
            <input
              type="text"
              placeholder="Username (max 31 chars)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={31}
              className="input-field"
            />
            <div className="file-input-container">
              <label className="file-input-label">
                {profilePicFileName || "Choose Profile Picture"}
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, "profilePic")}
                  accept="image/*"
                  className="file-input"
                />
              </label>
            </div>
            <button
              onClick={updateUserProfile}
              className="action-button"
              disabled={isLoading || !username}
            >
              {isLoading ? "Updating..." : "Update Profile"}
            </button>
          </div>
        </div>

        <div className="tweet-form">
          <h2>Create Tweet</h2>
          <textarea
            placeholder="What's happening? (max 31 chars)"
            value={tweetContent}
            onChange={(e) => setTweetContent(e.target.value)}
            maxLength={31}
            className="tweet-input"
          />
          <div className="tweet-actions">
            <div className="file-input-container">
              <label className="file-input-label">
                {mediaFileName || "Add Media"}
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, "media")}
                  accept="image/*"
                  className="file-input"
                />
              </label>
            </div>
            <button
              onClick={createTweet}
              className="action-button"
              disabled={isLoading || !tweetContent}
            >
              {isLoading ? "Posting..." : "Tweet"}
            </button>
          </div>
        </div>

        <div className="tweets-section">
          <h2>Tweets</h2>
          <button onClick={fetchAllTweets} className="refresh-button" disabled={isLoading}>
            {isLoading ? "Refreshing..." : "Refresh Tweets"}
          </button>
          
          {tweets.length === 0 ? (
            <p className="no-tweets-message">No tweets found. Be the first to tweet!</p>
          ) : (
            <div className="tweets-list">
              {tweets.map((tweet) => (
                <div key={tweet.id} className="tweet-card">
                  <div className="tweet-header">
                    {tweet.author.profilePic ? (
                      <img
                        src={tweet.author.profilePic}
                        alt="Author"
                        className="tweet-profile-pic"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/40?text=Error";
                        }}
                      />
                    ) : (
                      <div className="profile-placeholder"></div>
                    )}
                    <div className="tweet-author">
                      <span className="author-name">{tweet.author.name || formatAddress(tweet.author.address)}</span>
                      <span className="author-address">{formatAddress(tweet.author.address)}</span>
                    </div>
                  </div>
                  <div className="tweet-content">{tweet.content}</div>
                  {tweet.mediaUri && (
                    <div className="tweet-media">
                      <img
                        src={tweet.mediaUri}
                        alt="Tweet media"
                        className="tweet-image"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/300x200?text=Media+Error";
                        }}
                      />
                    </div>
                  )}
                  <div className="tweet-footer">
                    <button
                      onClick={() => likeTweet(tweet.id)}
                      className={`like-button ${tweet.hasLiked ? "liked" : ""}`}
                      disabled={isLoading || tweet.hasLiked}
                    >
                      {tweet.hasLiked ? "Liked" : "Like"} ({tweet.likes})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )}
    
    {notification.message && (
      <div className={`notification ${notification.type}`}>
        {notification.message}
      </div>
    )}
    
    {/* Debug Panel - Hidden in production */}
    <details className="debug-panel">
      <summary>Debug Log</summary>
      <div className="debug-log">
        {debugLog.map((log, index) => (
          <div key={index} className="log-entry">
            <span className="log-time">{log.time}</span>
            <span className="log-message">{log.message}</span>
          </div>
        ))}
      </div>
    </details>
  </div>
);
}
export default App;