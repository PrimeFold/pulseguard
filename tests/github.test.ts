import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchFileFromRepo, createFixPullRequest } from "@/lib/github";
import { Octokit } from "octokit";

describe("GitHub App Git Operations & Octokit Mocks", () => {
  let mockOctokit: any;

  beforeEach(() => {
    mockOctokit = {
      rest: {
        repos: {
          getContent: vi.fn(),
          createOrUpdateFileContents: vi.fn(),
        },
        git: {
          getRef: vi.fn(),
          createRef: vi.fn(),
        },
        pulls: {
          create: vi.fn(),
        },
      },
    };
  });

  describe("fetchFileFromRepo", () => {
    it("should fetch and decode file content successfully", async () => {
      const mockRawContent = "const x = 42;";
      const mockBase64 = Buffer.from(mockRawContent).toString("base64");

      mockOctokit.rest.repos.getContent.mockResolvedValue({
        data: {
          type: "file",
          content: mockBase64,
        },
      });

      const content = await fetchFileFromRepo(mockOctokit as any, "owner", "repo", "src/index.ts");
      expect(content).toBe(mockRawContent);
      expect(mockOctokit.rest.repos.getContent).toHaveBeenCalledWith({
        owner: "owner",
        repo: "repo",
        path: "src/index.ts",
        ref: "main",
      });
    });

    it("should throw error if content path is not a file", async () => {
      mockOctokit.rest.repos.getContent.mockResolvedValue({
        data: {
          type: "dir", // directory
        },
      });

      await expect(
        fetchFileFromRepo(mockOctokit as any, "owner", "repo", "src")
      ).rejects.toThrow('Target path "src" is not a readable file.');
    });
  });

  describe("createFixPullRequest", () => {
    it("should perform Git flow (get ref -> create branch -> update file -> open PR)", async () => {
      // 1. Mock base ref commit SHA
      mockOctokit.rest.git.getRef.mockResolvedValue({
        data: {
          object: { sha: "base_commit_sha_123" },
        },
      });

      // 2. Mock creating new branch ref
      mockOctokit.rest.git.createRef.mockResolvedValue({});

      // 3. Mock getting existing file SHA
      mockOctokit.rest.repos.getContent.mockResolvedValue({
        data: {
          sha: "old_file_sha_999",
        },
      });

      // 4. Mock file update
      mockOctokit.rest.repos.createOrUpdateFileContents.mockResolvedValue({});

      // 5. Mock PR creation
      mockOctokit.rest.pulls.create.mockResolvedValue({
        data: {
          number: 10,
          html_url: "https://github.com/owner/repo/pull/10",
        },
      });

      const result = await createFixPullRequest({
        octokit: mockOctokit as any,
        owner: "owner",
        repo: "repo",
        baseBranch: "main",
        newBranch: "fix/out-of-memory",
        filePath: "server.ts",
        updatedContent: "console.log('patched');",
        commitMessage: "fix: resolve memory leak",
        prTitle: "Hotfix: Resolve Server Memory Leak",
        prBody: "Automated fix from PulseGuard.",
      });

      // Assert sequence of API calls
      expect(mockOctokit.rest.git.getRef).toHaveBeenCalledWith({
        owner: "owner",
        repo: "repo",
        ref: "heads/main",
      });

      expect(mockOctokit.rest.git.createRef).toHaveBeenCalledWith({
        owner: "owner",
        repo: "repo",
        ref: "refs/heads/fix/out-of-memory",
        sha: "base_commit_sha_123",
      });

      expect(mockOctokit.rest.repos.createOrUpdateFileContents).toHaveBeenCalledWith({
        owner: "owner",
        repo: "repo",
        path: "server.ts",
        message: "fix: resolve memory leak",
        content: Buffer.from("console.log('patched');").toString("base64"),
        branch: "fix/out-of-memory",
        sha: "old_file_sha_999",
      });

      expect(mockOctokit.rest.pulls.create).toHaveBeenCalledWith({
        owner: "owner",
        repo: "repo",
        title: "Hotfix: Resolve Server Memory Leak",
        head: "fix/out-of-memory",
        base: "main",
        body: "Automated fix from PulseGuard.",
      });

      expect(result).toEqual({
        prNumber: 10,
        prUrl: "https://github.com/owner/repo/pull/10",
      });
    });
  });
});
