export const extractImageCaptions = async (postData: any) => {
  const results = [];
  const attachments =
    (postData && postData.attachments && postData.attachments.data) || [];

  for (const att of attachments) {
    if (att.subattachments && Array.isArray(att.subattachments.data)) {
      for (const sub of att.subattachments.data) {
        const url = sub.media?.image?.src || null;
        const caption = sub.description || sub.title || null;
        const photoId = sub.target?.id || null;
        results.push({ photoId, url, caption });
      }
    } else {
      // single attachment fallback
      console.log("Coming Here Bruhh!");
      console.log(att);
      const url = att.media?.image?.src || null;
      const caption = att.description || att.title || null;
      const photoId = att.target?.id || null;
      results.push({ photoId, url, caption });
    }
  }

  // if no attachment but message exists, optionally add a fallback record
  if (results.length === 0 && postData.message) {
    results.push({ photoId: null, url: null, caption: postData.message });
  }

  return results;
}