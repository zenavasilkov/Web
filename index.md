# Yauheni V.
## SOFTWARE ENGINEER

---

![profile](https://github.com/user-attachments/assets/2ff69e0a-89eb-4670-b09b-ee4ebaa814ae)


### Education  
`Software Engineer`

### Language proficiency  
English — **B2**

### Domains  
- FinTech  
- EdTech  
- Management  
- E-commerce  

---

Software engineer with 6+ years of commercial experience.  
I am a software engineer with 6 years of commercial experience specializing in the design and development of scalable web applications. My core expertise includes backend architecture, API integration, and responsive frontend implementation. Additionally, I have practical experience with cloud technologies and DevOps practices, ensuring efficient deployment and system reliability.

### Programming languages  
C#, Solidity, JavaScript, TypeScript, SQL.

### Backend  
.NET Core, ASP.NET WebAPI, Swagger, ASP.NET MVC, Entity Framework, Dapper, LINQ, gRPC, CQRS, MediatR, NUnit, Moq, FluentAssertions, FluentValidation, AutoMapper, Serilog, Postman, ElasticSearch, Auth0, MassTransit, MS Excel.

### Frontend  
React, Redux, Razor, HTML, CSS, Bootstrap.

### Message brokers  
RabbitMQ, Kafka, Azure (Service Bus, Event Hub).

### Databases  
MS SQL Server, PostgreSQL, MongoDB, Redis.

### Cloud  
MinIO, Azure (API Gateway, Event Hub, Functions, App Service, Application Insights, Key Vault, Blob Storage, Queue Storage), Selectel.

### DevOps  
Docker, Kubernetes, Logstash, Kibana, GitHub Actions, Grafana k6.

---

## Projects

### Intern Management System  
An internal platform designed to streamline the recruitment, onboarding, and evaluation process for company interns. The system allows HR managers to schedule interviews, assign mentors, track tasks, and evaluate performance through a unified interface. It features a drag-and-drop interface for task management and automated email notifications for status updates.

**Project roles**: Software Engineer  
**Period**: 08.2024 – till now  

**Responsibilities**:  
- Developed the core REST API using .NET Core and Entity Framework, establishing relationships between interns, mentors, and tasks  
- Created interactive UI components using React and React DnD (Drag and Drop) for the Kanban-style task board  
- Implemented background job processing using RabbitMQ and MassTransit to send automated email notifications  
- Integrated Auth0 SDK for React to manage user authentication and role-based access control  
- Ensured data validity and integrity using FluentValidation and AutoMapper for object-to-object mapping  
- Creation, enhancement, and optimization of VBA scripts to automate calculations, reporting, data processing, and routine operations in Excel  
- Wrote API documentation using Swagger to facilitate frontend-backend integration  
- Collaborated with the QA team to resolve bugs and improve application stability  

**Environment**:  
C#, JavaScript, TypeScript, SQL, VBA, .NET Core, ASP.NET WebAPI, Swagger, Entity Framework, LINQ, Fluent Assertions, Fluent Validation, AutoMapper, Auth0, MassTransit, React, HTML, CSS, RabbitMQ, PostgreSQL, Redis, GitHub Actions, Git, GitHub, MS Excel, Azure (Service Bus, Event Hub, Functions, App Service, Application Insights, Key Vault, Blob Storage).

---

### Financial Data Aggregation Platform  
A high-load distributed system designed to aggregate and analyze real-time financial data from multiple global stock exchanges. The platform provides institutional investors with low-latency updates, predictive analytics, and automated trading signals. It utilizes a microservices architecture to ensure high availability and fault tolerance, processing millions of transactions daily.

**Project roles**: Software Engineer  
**Period**: 05.2022 – 08.2024  

**Responsibilities**:  
- Integrated React frontend components with ASP.NET Core REST APIs, establishing seamless data flow with TypeScript interfaces  
- Refactored synchronous HTTP communication between microservices to asynchronous messaging using MassTransit and Kafka, decoupling the system and preventing timeouts  
- Designed and implemented resilient microservices architecture using gRPC for inter-service communication  
- Participated in migrating monolithic legacy codebase to modular structure using Domain-Driven Design (DDD) principles  
- Identified performance bottlenecks using Grafana k6 and Application Insights  
- Mentored junior developers on clean architecture and SOLID principles  
- Facilitated cross-team alignment by identifying critical dependencies during daily stand-ups and resolving blocking issues  

**Environment**:  
C#, JavaScript, TypeScript, SQL, .NET Core, ASP.NET WebAPI, Swagger, Entity Framework, LINQ, gRPC, CQRS, MediatR, Fluent Validation, Elasticsearch, Auth0, MassTransit, React, Redux, HTML, CSS, Bootstrap, Apache Kafka, MS SQL Server, PostgreSQL, MongoDB, Redis, Docker, Kubernetes, Logstash, Kibana, GitLab, Grafana k6, Azure (Service Bus, API Gateway, Functions, App Services, Application Insights, Key Vault, Blob Storage, Queue Storage).

---

```solidity
//SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";

contract MoodNft is ERC721 {
    uint256 private s_tokenCounter;
    string private s_happySvgImageUri;
    string private s_sadSvgImageUri;
    string private constant BASE_URI = "data:application/json;base64,";

    enum Mood {
        HAPPY,
        SAD
    }

    error MoodNft__CannotFlipMoodIfNotOwner();
    mapping(uint256 => Mood) private s_tokenIdToMood;

    constructor(string memory happySvgImageUri, string memory sadSvgImageUri) ERC721("Mood NFT", "MN") {
        s_tokenCounter = 0;
        s_happySvgImageUri = happySvgImageUri;
        s_sadSvgImageUri = sadSvgImageUri;
    }

    function mintNft() public {
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter++;
    }

    function flipMood(uint256 tokenId) public {
        if (getApproved(tokenId) != msg.sender && ownerOf(tokenId) != msg.sender) {
            revert MoodNft__CannotFlipMoodIfNotOwner();
        }

        if (s_tokenIdToMood[tokenId] == Mood.HAPPY) {
            s_tokenIdToMood[tokenId] = Mood.SAD;
        } else {
            s_tokenIdToMood[tokenId] = Mood.HAPPY;
        }
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);

        string memory imageURI;

        imageURI = s_tokenIdToMood[tokenId] == Mood.HAPPY ? s_happySvgImageUri : s_sadSvgImageUri;

        return string(
            abi.encodePacked(
                BASE_URI,
                Base64.encode(
                    abi.encodePacked(
                        '{"name":"',
                        name(),
                        '", "description":"An NFT that reflects the mood of the owner, 100% on Chain!", ',
                        '"attributes": [{"trait_type": "moodiness", "value": 100}], "image":"',
                        imageURI,
                        '"}'
                    )
                )
            )
        );
    }
}
