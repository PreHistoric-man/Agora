/**
 * Agora Demo AI Response Engine for Desktop Launcher
 * Provides realistic, deterministic responses with progressive streaming for the Demo Runtime.
 */

export const DEMO_PRESET_RESPONSES: Record<string, string> = {
  recursion_cpp: `Recursion is a programming technique where a function calls itself to solve a smaller sub-problem of the original problem, continuing until it reaches a defined base case.

Here is a classic example in C++ calculating a factorial:

\`\`\`cpp
#include <iostream>

// Recursive function to calculate factorial of n
int factorial(int n) {
    // 1. Base Case: prevents infinite recursion
    if (n <= 1) {
        return 1;
    }
    
    // 2. Recursive Step: calls itself with (n - 1)
    return n * factorial(n - 1);
}

int main() {
    int num = 5;
    std::cout << "Factorial of " << num << " is: " << factorial(num) << std::endl;
    return 0;
}
\`\`\`

### Key Components of Recursion:
1. **Base Case**: The termination condition that returns a value without further recursive calls.
2. **Recursive Step**: The logic that reduces the problem size towards the base case.
3. **Call Stack**: Each recursive call adds a stack frame to memory until base cases are resolved.`,

  recursion_general: `Recursion is a computational method where the solution to a problem depends on solutions to smaller instances of the same problem.

Key principles:
- **Base Case**: The stopping condition that terminates recursion.
- **Recursive Step**: Calling the function with a sub-problem that moves closer to the base case.
- **Stack Memory**: Every call occupies a frame on the call stack until resolved.`,

  cpp_general: `C++ is a high-performance, statically typed, compiled programming language that gives developers direct control over system memory and hardware resources.

### Core Features of Modern C++:
- **RAII (Resource Acquisition Is Initialization)**: Automatic memory and resource management via constructors and destructors.
- **Zero-Overhead Abstractions**: Templates, inline functions, and constexpr evaluation at compile time.
- **Smart Pointers**: \`std::unique_ptr\` and \`std::shared_ptr\` for safe, modern memory semantics without manual \`delete\`.
- **Standard Template Library (STL)**: High-performance containers (\`vector\`, \`unordered_map\`), algorithms, and concurrency primitives.`,

  python_general: `Python is a versatile, high-level, dynamically typed language emphasizing code readability, developer ergonomics, and rapid prototyping.

### Key Strengths:
- **Concise Syntax**: Express complex concepts in fewer lines of code.
- **AI & Data Science Ecosystem**: Industry standard tooling with PyTorch, TensorFlow, NumPy, and Pandas.
- **Rich Standard Library**: Built-in support for networking, JSON serialization, async I/O, and file manipulation.`,

  machine_learning: `Machine Learning (ML) is a branch of artificial intelligence where algorithms identify patterns from statistical data to make predictions or decisions without explicit rule programming.

### Three Primary Paradigms:
1. **Supervised Learning**: Models learn input-to-output mappings using labeled training datasets (e.g., classification, regression).
2. **Unsupervised Learning**: Uncovering latent structures and clusters in unlabeled data (e.g., PCA, k-means, autoencoders).
3. **Reinforcement Learning**: Agents learn optimal policy strategies through trial-and-error environmental reward feedback.`,

  api_general: `An API (Application Programming Interface) defines the protocol, data formats, and endpoints that allow different software systems to communicate and exchange data.

### Common Architectures:
- **RESTful APIs**: Stateless HTTP endpoints utilizing standard verbs (\`GET\`, \`POST\`, \`PUT\`, \`DELETE\`) with JSON payloads.
- **WebSocket / SSE**: Persistent, bidirectional or unidirectional real-time streaming connections.
- **gRPC / Protocol Buffers**: High-throughput binary RPC frameworks popular in microservice architectures.`,

  write_simple_program: `Here is a clean, modern C++ program demonstrating input processing, STL containers, and lambda transformations:

\`\`\`cpp
#include <iostream>
#include <vector>
#include <numeric>
#include <algorithm>

int main() {
    std::vector<int> scores = {88, 92, 79, 95, 84};

    // Calculate sum using STL accumulate
    int total = std::accumulate(scores.begin(), scores.end(), 0);
    double average = static_cast<double>(total) / scores.size();

    std::cout << "=== Agora Student Score Report ===" << std::endl;
    std::cout << "Count:   " << scores.size() << std::endl;
    std::cout << "Average: " << average << std::endl;

    // Filter high scores using std::count_if and lambda
    int honorRoll = std::count_if(scores.begin(), scores.end(), [](int s) {
        return s >= 90;
    });

    std::cout << "Honor Roll (>= 90): " << honorRoll << std::endl;
    return 0;
}
\`\`\``,

  summarize: `### Summary Overview
- **Objective**: Execute localized AI inference via Agora Local Runtime.
- **Status**: Operational in deterministic Demo Runtime mode.
- **Architecture**: Decoupled RuntimeManager abstraction supporting zero-dependency mock simulation and live Ollama connectivity.`,

  help_learn: `Welcome to the Agora Developer Guide! Here is a structured roadmap for mastering local AI models and systems programming:

1. **Foundations**: C++, Python, Computer Systems Architecture, and Memory Management.
2. **AI & Inference**: Transformer architecture, quantization (GGUF, AWQ), and token generation loops.
3. **Deployment**: Local Ollama runtime orchestration, REST API bridges, and cloud containerization.`
};

/**
 * Matches a prompt to a deterministic demo response.
 */
export function getDemoResponseForPrompt(prompt: string, modelName: string = 'Qwen3 Demo'): string {
  const p = (prompt || '').trim().toLowerCase();

  // 1. Hello / greeting
  if (/^(hello|hi|hey|greetings|hola|good\s*(morning|afternoon|evening))/i.test(p)) {
    return `Hello! I am **${modelName}**, running on the **Agora Demo Local AI Runtime**.

I am ready to assist you with:
- 💡 **Coding & Algorithms**: C++, Python, TypeScript, Rust, and systems programming
- 🧠 **Concept Explanations**: Recursion, Data Structures, Machine Learning, and APIs
- ⚡ **Local Inference Testing**: Exploring deterministic streaming and offline capabilities

Try asking me: *"Explain recursion in C++"* or *"Write a simple program in C++"*!`;
  }

  // 2. Recursion + C++
  if ((p.includes('recursion') || p.includes('recursive')) && (p.includes('c++') || p.includes('cpp'))) {
    return DEMO_PRESET_RESPONSES.recursion_cpp;
  }

  // 3. Recursion general
  if (p.includes('recursion') || p.includes('recursive')) {
    return DEMO_PRESET_RESPONSES.recursion_general + '\n\n' + DEMO_PRESET_RESPONSES.recursion_cpp;
  }

  // 4. C++ general
  if (p.includes('c++') || p.includes('cpp') || p.includes('c plus plus')) {
    return DEMO_PRESET_RESPONSES.cpp_general;
  }

  // 5. Python general
  if (p.includes('python') || p.includes('py ')) {
    return DEMO_PRESET_RESPONSES.python_general;
  }

  // 6. Machine Learning / Deep Learning / AI
  if (p.includes('machine learning') || p.includes('ml') || p.includes('deep learning') || p.includes('neural network')) {
    return DEMO_PRESET_RESPONSES.machine_learning;
  }

  // 7. API / endpoints
  if (p.includes('api') || p.includes('rest') || p.includes('endpoint')) {
    return DEMO_PRESET_RESPONSES.api_general;
  }

  // 8. Write program / code example
  if (p.includes('program') || p.includes('write code') || p.includes('example code') || p.includes('code snippet')) {
    return DEMO_PRESET_RESPONSES.write_simple_program;
  }

  // 9. Summarize
  if (p.includes('summar') || p.includes('recap') || p.includes('tldr')) {
    return DEMO_PRESET_RESPONSES.summarize;
  }

  // 10. Help me learn / guide
  if (p.includes('help me learn') || p.includes('roadmap') || p.includes('guide') || p.includes('learn')) {
    return DEMO_PRESET_RESPONSES.help_learn;
  }

  // 11. Generic fallback response
  return `This response was generated by Agora's **Demo Runtime** for **${modelName}**.

You asked:
> "${prompt}"

In production, this request would be forwarded to the selected local AI model via Ollama or custom local runtime.

### Key Observation:
- **Runtime**: Demo Local Runtime (Hackathon Mode)
- **Model**: ${modelName}
- **Streaming**: Verified progressive token delivery
- **Status**: Ready for real-time model substitution`;
}
