import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import 'dotenv/config'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined')
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const rawData = `
PHASE 0 — Warm-up (30)
Arrays / Basics

#1 Two Sum
https://leetcode.com/problems/two-sum/

#26 Remove Duplicates from Sorted Array
https://leetcode.com/problems/remove-duplicates-from-sorted-array/

#27 Remove Element
https://leetcode.com/problems/remove-element/

#121 Best Time to Buy and Sell Stock
https://leetcode.com/problems/best-time-to-buy-and-sell-stock/

#53 Maximum Subarray
https://leetcode.com/problems/maximum-subarray/

#66 Plus One
https://leetcode.com/problems/plus-one/

#88 Merge Sorted Array
https://leetcode.com/problems/merge-sorted-array/

#169 Majority Element
https://leetcode.com/problems/majority-element/

#217 Contains Duplicate
https://leetcode.com/problems/contains-duplicate/

#268 Missing Number
https://leetcode.com/problems/missing-number/

Strings

#344 Reverse String
https://leetcode.com/problems/reverse-string/

#125 Valid Palindrome
https://leetcode.com/problems/valid-palindrome/

#242 Valid Anagram
https://leetcode.com/problems/valid-anagram/

#387 First Unique Character
https://leetcode.com/problems/first-unique-character-in-a-string/

#58 Length of Last Word
https://leetcode.com/problems/length-of-last-word/

PHASE 1 — Core Foundations (120)
Arrays + Two Pointers (25)

#167 Two Sum II
https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/

#283 Move Zeroes
https://leetcode.com/problems/move-zeroes/

#11 Container With Most Water
https://leetcode.com/problems/container-with-most-water/

#15 3Sum
https://leetcode.com/problems/3sum/

#16 3Sum Closest
https://leetcode.com/problems/3sum-closest/

#18 4Sum
https://leetcode.com/problems/4sum/

#31 Next Permutation
https://leetcode.com/problems/next-permutation/

#42 Trapping Rain Water
https://leetcode.com/problems/trapping-rain-water/

#238 Product of Array Except Self
https://leetcode.com/problems/product-of-array-except-self/

#560 Subarray Sum Equals K
https://leetcode.com/problems/subarray-sum-equals-k/

#525 Contiguous Array
https://leetcode.com/problems/contiguous-array/

#974 Subarray Sums Divisible by K
https://leetcode.com/problems/subarray-sums-divisible-by-k/

#189 Rotate Array
https://leetcode.com/problems/rotate-array/

#75 Sort Colors
https://leetcode.com/problems/sort-colors/

#845 Longest Mountain in Array
https://leetcode.com/problems/longest-mountain-in-array/

#1248 Count Number of Nice Subarrays
https://leetcode.com/problems/count-number-of-nice-subarrays/

#1004 Max Consecutive Ones III
https://leetcode.com/problems/max-consecutive-ones-iii/

#930 Binary Subarrays With Sum
https://leetcode.com/problems/binary-subarrays-with-sum/

#209 Minimum Size Subarray Sum
https://leetcode.com/problems/minimum-size-subarray-sum/

#485 Max Consecutive Ones
https://leetcode.com/problems/max-consecutive-ones/

#414 Third Maximum Number
https://leetcode.com/problems/third-maximum-number/

#287 Find Duplicate Number
https://leetcode.com/problems/find-the-duplicate-number/

#977 Squares of a Sorted Array
https://leetcode.com/problems/squares-of-a-sorted-array/

#905 Sort Array By Parity
https://leetcode.com/problems/sort-array-by-parity/

#1013 Partition Array Into Three Parts
https://leetcode.com/problems/partition-array-into-three-parts-with-equal-sum/

Hashing (15)

#49 Group Anagrams
https://leetcode.com/problems/group-anagrams/

#128 Longest Consecutive Sequence
https://leetcode.com/problems/longest-consecutive-sequence/

#560 Subarray Sum Equals K
https://leetcode.com/problems/subarray-sum-equals-k/

#525 Contiguous Array
https://leetcode.com/problems/contiguous-array/

#347 Top K Frequent Elements
https://leetcode.com/problems/top-k-frequent-elements/

#451 Sort Characters by Frequency
https://leetcode.com/problems/sort-characters-by-frequency/

#383 Ransom Note
https://leetcode.com/problems/ransom-note/

#219 Contains Duplicate II
https://leetcode.com/problems/contains-duplicate-ii/

#290 Word Pattern
https://leetcode.com/problems/word-pattern/

#409 Longest Palindrome
https://leetcode.com/problems/longest-palindrome/

#387 First Unique Character
https://leetcode.com/problems/first-unique-character-in-a-string/

#136 Single Number
https://leetcode.com/problems/single-number/

#169 Majority Element
https://leetcode.com/problems/majority-element/

#202 Happy Number
https://leetcode.com/problems/happy-number/

#205 Isomorphic Strings
https://leetcode.com/problems/isomorphic-strings/

Stack & Queue (15)

#20 Valid Parentheses
https://leetcode.com/problems/valid-parentheses/

#155 Min Stack
https://leetcode.com/problems/min-stack/

#232 Implement Queue using Stacks
https://leetcode.com/problems/implement-queue-using-stacks/

#496 Next Greater Element I
https://leetcode.com/problems/next-greater-element-i/

#503 Next Greater Element II
https://leetcode.com/problems/next-greater-element-ii/

#739 Daily Temperatures
https://leetcode.com/problems/daily-temperatures/

#84 Largest Rectangle in Histogram
https://leetcode.com/problems/largest-rectangle-in-histogram/

#85 Maximal Rectangle
https://leetcode.com/problems/maximal-rectangle/

#42 Trapping Rain Water
https://leetcode.com/problems/trapping-rain-water/

#150 Evaluate Reverse Polish Notation
https://leetcode.com/problems/evaluate-reverse-polish-notation/

#225 Implement Stack using Queues
https://leetcode.com/problems/implement-stack-using-queues/

#402 Remove K Digits
https://leetcode.com/problems/remove-k-digits/

#735 Asteroid Collision
https://leetcode.com/problems/asteroid-collision/

#901 Online Stock Span
https://leetcode.com/problems/online-stock-span/

#239 Sliding Window Maximum
https://leetcode.com/problems/sliding-window-maximum/

Linked List (10)

#206 Reverse Linked List
https://leetcode.com/problems/reverse-linked-list/

#141 Linked List Cycle
https://leetcode.com/problems/linked-list-cycle/

#142 Linked List Cycle II
https://leetcode.com/problems/linked-list-cycle-ii/

#21 Merge Two Sorted Lists
https://leetcode.com/problems/merge-two-sorted-lists/

#23 Merge K Sorted Lists
https://leetcode.com/problems/merge-k-sorted-lists/

#19 Remove Nth Node From End
https://leetcode.com/problems/remove-nth-node-from-end-of-list/

#160 Intersection of Two Linked Lists
https://leetcode.com/problems/intersection-of-two-linked-lists/

#234 Palindrome Linked List
https://leetcode.com/problems/palindrome-linked-list/

#328 Odd Even Linked List
https://leetcode.com/problems/odd-even-linked-list/

#92 Reverse Linked List II
https://leetcode.com/problems/reverse-linked-list-ii/

Binary Search (15)

#704 Binary Search
https://leetcode.com/problems/binary-search/

#35 Search Insert Position
https://leetcode.com/problems/search-insert-position/

#33 Search in Rotated Sorted Array
https://leetcode.com/problems/search-in-rotated-sorted-array/

#34 Find First and Last Position
https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/

#153 Find Minimum in Rotated Sorted Array
https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/

#162 Find Peak Element
https://leetcode.com/problems/find-peak-element/

#875 Koko Eating Bananas
https://leetcode.com/problems/koko-eating-bananas/

#1011 Capacity To Ship Packages
https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/

#410 Split Array Largest Sum
https://leetcode.com/problems/split-array-largest-sum/

#1482 Minimum Days to Make Bouquets
https://leetcode.com/problems/minimum-number-of-days-to-make-m-bouquets/

#240 Search a 2D Matrix II
https://leetcode.com/problems/search-a-2d-matrix-ii/

#74 Search a 2D Matrix
https://leetcode.com/problems/search-a-2d-matrix/

#81 Search in Rotated Sorted Array II
https://leetcode.com/problems/search-in-rotated-sorted-array-ii/

#69 Sqrt(x)
https://leetcode.com/problems/sqrtx/

#367 Valid Perfect Square
https://leetcode.com/problems/valid-perfect-square/

PHASE 2 — Trees & Graphs (90)
Trees / BST (40)

#94 Inorder Traversal
https://leetcode.com/problems/binary-tree-inorder-traversal/

#144 Preorder Traversal
https://leetcode.com/problems/binary-tree-preorder-traversal/

#145 Postorder Traversal
https://leetcode.com/problems/binary-tree-postorder-traversal/

#102 Level Order Traversal
https://leetcode.com/problems/binary-tree-level-order-traversal/

#104 Max Depth
https://leetcode.com/problems/maximum-depth-of-binary-tree/

#110 Balanced Binary Tree
https://leetcode.com/problems/balanced-binary-tree/

#543 Diameter of Binary Tree
https://leetcode.com/problems/diameter-of-binary-tree/

#236 LCA
https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/

#124 Binary Tree Max Path Sum
https://leetcode.com/problems/binary-tree-maximum-path-sum/

#112 Path Sum
https://leetcode.com/problems/path-sum/

#113 Path Sum II
https://leetcode.com/problems/path-sum-ii/

#437 Path Sum III
https://leetcode.com/problems/path-sum-iii/

#226 Invert Binary Tree
https://leetcode.com/problems/invert-binary-tree/

#617 Merge Two Trees
https://leetcode.com/problems/merge-two-binary-trees/

#98 Validate BST
https://leetcode.com/problems/validate-binary-search-tree/

#230 Kth Smallest in BST
https://leetcode.com/problems/kth-smallest-element-in-a-bst/

#450 Delete Node in BST
https://leetcode.com/problems/delete-node-in-a-bst/

#701 Insert into BST
https://leetcode.com/problems/insert-into-a-binary-search-tree/

#297 Serialize and Deserialize
https://leetcode.com/problems/serialize-and-deserialize-binary-tree/

#199 Right Side View
https://leetcode.com/problems/binary-tree-right-side-view/

#101 Symmetric Tree
https://leetcode.com/problems/symmetric-tree/

#114 Flatten Binary Tree
https://leetcode.com/problems/flatten-binary-tree-to-linked-list/

#129 Sum Root to Leaf
https://leetcode.com/problems/sum-root-to-leaf-numbers/

#257 Binary Tree Paths
https://leetcode.com/problems/binary-tree-paths/

#404 Sum of Left Leaves
https://leetcode.com/problems/sum-of-left-leaves/

#637 Average of Levels
https://leetcode.com/problems/average-of-levels-in-binary-tree/

#662 Max Width of Binary Tree
https://leetcode.com/problems/maximum-width-of-binary-tree/

#938 Range Sum BST
https://leetcode.com/problems/range-sum-of-bst/

#987 Vertical Order Traversal
https://leetcode.com/problems/vertical-order-traversal-of-a-binary-tree/

#116 Populating Next Right
https://leetcode.com/problems/populating-next-right-pointers-in-each-node/

#222 Count Complete Tree Nodes
https://leetcode.com/problems/count-complete-tree-nodes/

#572 Subtree of Another Tree
https://leetcode.com/problems/subtree-of-another-tree/

#103 Zigzag Level Order
https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/

#863 Nodes Distance K
https://leetcode.com/problems/all-nodes-distance-k-in-binary-tree/

#865 Smallest Subtree with All Deepest
https://leetcode.com/problems/smallest-subtree-with-all-the-deepest-nodes/

Graphs (50)

#200 Number of Islands
https://leetcode.com/problems/number-of-islands/

#695 Max Area of Island
https://leetcode.com/problems/max-area-of-island/

#733 Flood Fill
https://leetcode.com/problems/flood-fill/

#994 Rotting Oranges
https://leetcode.com/problems/rotting-oranges/

#542 01 Matrix
https://leetcode.com/problems/01-matrix/

#207 Course Schedule
https://leetcode.com/problems/course-schedule/

#210 Course Schedule II
https://leetcode.com/problems/course-schedule-ii/

#785 Is Graph Bipartite
https://leetcode.com/problems/is-graph-bipartite/

#797 All Paths Source to Target
https://leetcode.com/problems/all-paths-from-source-to-target/

#133 Clone Graph
https://leetcode.com/problems/clone-graph/

#684 Redundant Connection
https://leetcode.com/problems/redundant-connection/

#547 Number of Provinces
https://leetcode.com/problems/number-of-provinces/

#1319 Number of Operations to Make Network Connected
https://leetcode.com/problems/number-of-operations-to-make-network-connected/

#127 Word Ladder
https://leetcode.com/problems/word-ladder/

#743 Network Delay Time
https://leetcode.com/problems/network-delay-time/

#778 Swim in Rising Water
https://leetcode.com/problems/swim-in-rising-water/

#1631 Path With Minimum Effort
https://leetcode.com/problems/path-with-minimum-effort/

#329 Longest Increasing Path
https://leetcode.com/problems/longest-increasing-path-in-a-matrix/

#815 Bus Routes
https://leetcode.com/problems/bus-routes/

#934 Shortest Bridge
https://leetcode.com/problems/shortest-bridge/

#1192 Critical Connections
https://leetcode.com/problems/critical-connections-in-a-network/

#787 Cheapest Flights
https://leetcode.com/problems/cheapest-flights-within-k-stops/

#1129 Shortest Path Alternating Colors
https://leetcode.com/problems/shortest-path-with-alternating-colors/

#886 Possible Bipartition
https://leetcode.com/problems/possible-bipartition/

#1020 Number of Enclaves
https://leetcode.com/problems/number-of-enclaves/

#1466 Reorder Routes
https://leetcode.com/problems/reorder-routes-to-make-all-paths-lead-to-the-city-zero/

#980 Unique Paths III
https://leetcode.com/problems/unique-paths-iii/

#1091 Shortest Path Binary Matrix
https://leetcode.com/problems/shortest-path-in-binary-matrix/

#417 Pacific Atlantic
https://leetcode.com/problems/pacific-atlantic-water-flow/

#841 Keys and Rooms
https://leetcode.com/problems/keys-and-rooms/

#997 Find Town Judge
https://leetcode.com/problems/find-the-town-judge/

#332 Reconstruct Itinerary
https://leetcode.com/problems/reconstruct-itinerary/

#1584 Min Cost to Connect Points
https://leetcode.com/problems/min-cost-to-connect-all-points/

#847 Shortest Path Visiting All Nodes
https://leetcode.com/problems/shortest-path-visiting-all-nodes/

#785 Is Graph Bipartite
https://leetcode.com/problems/is-graph-bipartite/

#1557 Min Number of Vertices
https://leetcode.com/problems/minimum-number-of-vertices-to-reach-all-nodes/

#130 Surrounded Regions
https://leetcode.com/problems/surrounded-regions/

#490 The Maze
https://leetcode.com/problems/the-maze/
(Note: The Maze is a Premium problem, link may redirect if not subscribed)

#505 The Maze II
https://leetcode.com/problems/the-maze-ii/
(Note: The Maze II is a Premium problem)

#847 Shortest Path All Nodes
https://leetcode.com/problems/shortest-path-visiting-all-nodes/

PHASE 3 — Dynamic Programming (80)
1D DP (20)

#70 Climbing Stairs
https://leetcode.com/problems/climbing-stairs/

#198 House Robber
https://leetcode.com/problems/house-robber/

#213 House Robber II
https://leetcode.com/problems/house-robber-ii/

#746 Min Cost Climbing Stairs
https://leetcode.com/problems/min-cost-climbing-stairs/

#91 Decode Ways
https://leetcode.com/problems/decode-ways/

#322 Coin Change
https://leetcode.com/problems/coin-change/

#518 Coin Change II
https://leetcode.com/problems/coin-change-ii/

#300 LIS
https://leetcode.com/problems/longest-increasing-subsequence/

#416 Partition Equal Subset
https://leetcode.com/problems/partition-equal-subset-sum/

#343 Integer Break
https://leetcode.com/problems/integer-break/

#740 Delete and Earn
https://leetcode.com/problems/delete-and-earn/

#55 Jump Game
https://leetcode.com/problems/jump-game/

#45 Jump Game II
https://leetcode.com/problems/jump-game-ii/

#376 Wiggle Subsequence
https://leetcode.com/problems/wiggle-subsequence/

#139 Word Break
https://leetcode.com/problems/word-break/

#152 Maximum Product Subarray
https://leetcode.com/problems/maximum-product-subarray/

#96 Unique BST
https://leetcode.com/problems/unique-binary-search-trees/

#397 Integer Replacement
https://leetcode.com/problems/integer-replacement/

#1027 Longest Arithmetic Subsequence
https://leetcode.com/problems/longest-arithmetic-subsequence/

#1449 Form Largest Integer
https://leetcode.com/problems/form-largest-integer-with-digits-that-add-up-to-target/

2D / String DP (30)

#62 Unique Paths
https://leetcode.com/problems/unique-paths/

#63 Unique Paths II
https://leetcode.com/problems/unique-paths-ii/

#64 Minimum Path Sum
https://leetcode.com/problems/minimum-path-sum/

#1143 LCS
https://leetcode.com/problems/longest-common-subsequence/

#72 Edit Distance
https://leetcode.com/problems/edit-distance/

#516 Longest Palindromic Subsequence
https://leetcode.com/problems/longest-palindromic-subsequence/

#5 Longest Palindromic Substring
https://leetcode.com/problems/longest-palindromic-substring/

#221 Maximal Square
https://leetcode.com/problems/maximal-square/

#494 Target Sum
https://leetcode.com/problems/target-sum/

#312 Burst Balloons
https://leetcode.com/problems/burst-balloons/

#131 Palindrome Partitioning
https://leetcode.com/problems/palindrome-partitioning/

#115 Distinct Subsequences
https://leetcode.com/problems/distinct-subsequences/

#97 Interleaving String
https://leetcode.com/problems/interleaving-string/

#583 Delete Operation
https://leetcode.com/problems/delete-operation-for-two-strings/

#10 Regular Expression Matching
https://leetcode.com/problems/regular-expression-matching/

#44 Wildcard Matching
https://leetcode.com/problems/wildcard-matching/

#132 Palindrome Partitioning II
https://leetcode.com/problems/palindrome-partitioning-ii/

#1092 Shortest Common Supersequence
https://leetcode.com/problems/shortest-common-supersequence/

#1035 Uncrossed Lines
https://leetcode.com/problems/uncrossed-lines/

#647 Palindromic Substrings
https://leetcode.com/problems/palindromic-substrings/

Tree / Advanced DP (15)

#337 House Robber III
https://leetcode.com/problems/house-robber-iii/

#124 Binary Tree Max Path Sum
https://leetcode.com/problems/binary-tree-maximum-path-sum/

#968 Binary Tree Cameras
https://leetcode.com/problems/binary-tree-cameras/

#1026 Max Difference
https://leetcode.com/problems/maximum-difference-between-node-and-ancestor/

#834 Sum of Distances in Tree
https://leetcode.com/problems/sum-of-distances-in-tree/

#1240 Tiling Rectangle
https://leetcode.com/problems/tiling-a-rectangle-with-the-fewest-squares/

#887 Super Egg Drop
https://leetcode.com/problems/super-egg-drop/

#920 Number of Music Playlists
https://leetcode.com/problems/number-of-music-playlists/

#1463 Cherry Pickup II
https://leetcode.com/problems/cherry-pickup-ii/

#1335 Min Difficulty Job Schedule
https://leetcode.com/problems/minimum-difficulty-of-a-job-schedule/

#1687 Delivering Boxes
https://leetcode.com/problems/delivering-boxes-from-storage-to-ports/

#879 Profitable Schemes
https://leetcode.com/problems/profitable-schemes/

#689 Max Sum of 3 Subarrays
https://leetcode.com/problems/maximum-sum-of-3-non-overlapping-subarrays/

#1340 Jump Game V
https://leetcode.com/problems/jump-game-v/

#1937 Max Number of Points
https://leetcode.com/problems/maximum-number-of-points-with-cost/

PHASE 4 — Advanced / Killers (50)
Heaps

#215 Kth Largest Element
https://leetcode.com/problems/kth-largest-element-in-an-array/

#703 Kth Largest in Stream
https://leetcode.com/problems/kth-largest-element-in-a-stream/

#295 Median Finder
https://leetcode.com/problems/find-median-from-data-stream/

#973 K Closest Points
https://leetcode.com/problems/k-closest-points-to-origin/

#347 Top K Frequent
https://leetcode.com/problems/top-k-frequent-elements/

Greedy

#435 Non-overlapping Intervals
https://leetcode.com/problems/non-overlapping-intervals/

#452 Minimum Arrows
https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/

#621 Task Scheduler
https://leetcode.com/problems/task-scheduler/

#406 Queue Reconstruction
https://leetcode.com/problems/queue-reconstruction-by-height/

#135 Candy
https://leetcode.com/problems/candy/

Backtracking

#46 Permutations
https://leetcode.com/problems/permutations/

#47 Permutations II
https://leetcode.com/problems/permutations-ii/

#39 Combination Sum
https://leetcode.com/problems/combination-sum/

#40 Combination Sum II
https://leetcode.com/problems/combination-sum-ii/

#51 N-Queens
https://leetcode.com/problems/n-queens/

Bit Manipulation

#136 Single Number
https://leetcode.com/problems/single-number/

#137 Single Number II
https://leetcode.com/problems/single-number-ii/

#260 Single Number III
https://leetcode.com/problems/single-number-iii/

#78 Subsets
https://leetcode.com/problems/subsets/

#90 Subsets II
https://leetcode.com/problems/subsets-ii/

Tries

#208 Implement Trie
https://leetcode.com/problems/implement-trie-prefix-tree/

#211 Word Dictionary
https://leetcode.com/problems/design-add-and-search-words-data-structure/

#212 Word Search II
https://leetcode.com/problems/word-search-ii/
`

async function main() {
  console.log('Start seeding ...')
  
  // Clear existing data
  await prisma.dSAQuestion.deleteMany({})
  await prisma.cSConcept.deleteMany({})
  
  // Seed CS Concepts
  const csSubjects = [
    { subject: 'OS', topics: ['Process Management', 'Memory Management', 'File Systems', 'Deadlocks', 'Threads'] },
    { subject: 'DBMS', topics: ['SQL', 'Normalization', 'Indexing', 'Transactions', 'ACID Properties'] },
    { subject: 'Networking', topics: ['OSI Model', 'TCP/IP', 'HTTP/HTTPS', 'DNS', 'Socket Programming'] },
    { subject: 'OOPS', topics: ['Classes & Objects', 'Inheritance', 'Polymorphism', 'Encapsulation', 'Abstraction'] }
  ]
  
  for (const sub of csSubjects) {
    for (const topic of sub.topics) {
      await prisma.cSConcept.create({
        data: {
          subject: sub.subject,
          topic: topic,
          status: 'TODO'
        }
      })
    }
  }

  // Seed DSA Questions
  const lines = rawData.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  let currentPhase = 'PHASE 0 — Warm-up';
  let currentTopic = 'General';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith('PHASE')) {
      currentPhase = line.split('(')[0].trim();
      currentTopic = ''; 
      continue;
    }
    
    // If it's a topic header (not a link, not a question, not a phase)
    if (!line.startsWith('#') && !line.startsWith('http') && !line.startsWith('PHASE')) {
      currentTopic = line;
      continue;
    }
    
    if (line.startsWith('#')) {
      const title = line;
      let link = '';
      
      // Check if next line is a link
      if (i + 1 < lines.length && lines[i+1].startsWith('http')) {
        link = lines[i+1];
        i++; // Skip next line in the loop
      }
      
      await prisma.dSAQuestion.create({
        data: {
          title,
          link,
          phase: currentPhase,
          topic: currentTopic || 'General',
          status: 'TODO'
        }
      });
    }
  }
  
  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })