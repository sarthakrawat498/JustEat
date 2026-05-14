# AI Usage Declaration

---

## 1. Introduction

This document outlines the use of Artificial Intelligence (AI) tools during the development of this project. AI tools were used in a **limited and controlled manner** to assist with frontend development, debugging, testing, database schema mapping, and documentation. All final decisions, implementations, and validations were performed independently.

---

## 2. AI Tools Utilized

The following AI tools were used during the development process:

| Tool | Purpose |
|------|---------|
| **OpenAI (ChatGPT)** | Frontend assistance, debugging support, testing, database schema mapping, documentation drafting |
| **GitHub Copilot** | Code suggestions and inline completions |

> These tools were used strictly as **supportive development aids**.

---

## 3. Scope of AI Assistance

### 3.1 Frontend Development

AI tools were used to assist in frontend-related tasks, including:

- Generating and refining React component structures
- Improving UI layout and styling using Tailwind CSS
- Creating reusable helper functions
- Enhancing overall user interface consistency and usability

> All generated code was reviewed, modified where necessary, and integrated carefully into the project.

---

### 3.2 Debugging and Issue Resolution

AI tools were used to support debugging activities, including:

- Identifying issues in frontend logic
- Suggesting possible fixes for runtime errors
- Improving code readability and maintainability

> All debugging suggestions were critically evaluated and tested before being applied.

---

### 3.3 Documentation Assistance

AI tools were used to assist in preparing project documentation, including:

- Structuring technical documentation
- Drafting explanatory sections
- Formatting content for clarity and readability

> All documentation was reviewed and refined to ensure accuracy and completeness.

---

### 3.4 Testing

AI tools were used to assist in writing unit tests for the service layer, including:

- Generating JUnit 5 test class structures with Mockito
- Suggesting test cases for individual service methods
- Identifying edge cases and error scenarios to cover
- Structuring mock setups and assertion patterns

> All generated tests were reviewed, validated against actual service behaviour, and executed successfully before being committed.

---

### 3.5 Database Schema Mapping

AI tools were used to assist with database design and entity mapping, including:

- Advising on JPA entity relationships (`@OneToMany`, `@ManyToMany`, etc.)
- Suggesting join table configurations and column constraints
- Reviewing schema design for consistency and normalisation
- Assisting with the resolution of lazy loading and circular reference issues

> All schema decisions were independently validated and tested against the running database before being finalised.

---

## 4. Limitations of AI Usage

| Constraint | Details |
|-----------|---------|
| Core business logic | AI tools were **not** used to implement core backend business logic independently |
| Manual validation required | No AI-generated code or schema was used without manual review and testing |
| Independent architecture | All architectural and design decisions were made independently |
| Suggestions only | AI outputs were treated as suggestions rather than authoritative solutions |

---

## 5. Conclusion

AI tools were used **responsibly** as supportive instruments to improve development efficiency and documentation quality. The overall system design, implementation, and validation remain the result of **independent development efforts**.

---



