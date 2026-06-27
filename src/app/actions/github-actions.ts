'use server';

/**
 * @fileOverview Server actions for GitHub repository integration.
 * Optimized for robust error handling to prevent 500 Internal Server Errors.
 */

export async function uploadToGithub(fileName: string, base64Content: string, subfolder: string = 'general') {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = 'main';

  // Check for configuration before attempting upload
  if (!token || !owner || !repo) {
    console.error('SERVER ACTION ERROR: GitHub configuration missing (GITHUB_TOKEN, GITHUB_OWNER, or GITHUB_REPO)');
    throw new Error('Konfigurasi GitHub belum lengkap di server. Pastikan Environment Variables telah diatur.');
  }

  // Clean filename and structure path into folders
  const cleanFileName = fileName.replace(/[^a-zA-Z0-9.]/g, '-');
  const cleanSubfolder = subfolder.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  const path = `motorcycles/${cleanSubfolder}/${Date.now()}-${cleanFileName}`;
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        message: `Upload motorcycle asset: ${path}`,
        content: base64Content,
        branch: branch,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('GITHUB API ERROR:', data);
      throw new Error(data.message || 'Gagal mengunggah ke GitHub');
    }

    return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
  } catch (error: any) {
    console.error('FATAL UPLOAD ERROR:', error);
    throw new Error(error.message || 'Terjadi kesalahan sistem saat mengunggah file.');
  }
}
