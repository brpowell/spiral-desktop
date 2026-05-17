use crate::models::TrackMetadataUpdate;
use id3::frame::{Picture, PictureType};
use id3::{Tag, TagLike};
use metaflac::block::PictureType as FlacPictureType;
use metaflac::Tag as FlacTag;
use mp4ameta::{Data, Tag as Mp4Tag};
use std::path::Path;

#[derive(Debug)]
pub enum MetadataWriteError {
    UnsupportedFormat(String),
    ReadOnly(String),
    Io(String),
    Tag(String),
}

impl MetadataWriteError {
    pub fn to_message(self) -> String {
        match self {
            Self::UnsupportedFormat(msg) => msg,
            Self::ReadOnly(msg) => msg,
            Self::Io(msg) => msg,
            Self::Tag(msg) => msg,
        }
    }
}

fn ensure_writable(path: &Path) -> Result<(), MetadataWriteError> {
    if !path.exists() {
        return Err(MetadataWriteError::Io(format!(
            "File not found: {}",
            path.display()
        )));
    }
    let meta = std::fs::metadata(path)
        .map_err(|e| MetadataWriteError::Io(format!("Cannot access file: {e}")))?;
    if meta.permissions().readonly() {
        return Err(MetadataWriteError::ReadOnly(
            "This file is read-only. Remove the read-only flag or choose a writable copy."
                .to_string(),
        ));
    }
    Ok(())
}

fn audio_extension(path: &Path) -> Option<String> {
    path.extension()
        .and_then(|e| e.to_str())
        .map(|e| e.to_ascii_lowercase())
}

fn read_image_bytes(art_path: &str) -> Result<Vec<u8>, MetadataWriteError> {
    std::fs::read(art_path)
        .map_err(|e| MetadataWriteError::Io(format!("Failed to read album art: {e}")))
}

fn mime_for_path(path: &str) -> String {
    let lower = path.to_ascii_lowercase();
    if lower.ends_with(".png") {
        "image/png".to_string()
    } else if lower.ends_with(".webp") {
        "image/webp".to_string()
    } else {
        "image/jpeg".to_string()
    }
}

fn mp4_artwork_data(art_path: &str, bytes: Vec<u8>) -> Data {
    if art_path.to_ascii_lowercase().ends_with(".png") {
        Data::Png(bytes)
    } else {
        Data::Jpeg(bytes)
    }
}

fn apply_common_mp4(tag: &mut Mp4Tag, metadata: &TrackMetadataUpdate) {
    tag.set_title(metadata.title.clone());
    if let Some(artist) = &metadata.artist {
        tag.set_artist(artist.clone());
    }
    if let Some(album) = &metadata.album {
        tag.set_album(album.clone());
    }
    if let Some(album_artist) = &metadata.album_artist {
        tag.set_album_artist(album_artist.clone());
    }
    if let Some(n) = metadata.track_number {
        tag.set_track_number(n as u16, 0);
    }
    if let Some(n) = metadata.disc_number {
        tag.set_disc_number(n as u16, 0);
    }
    if let Some(year) = metadata.year {
        tag.set_year(year.to_string());
    }
    if let Some(genre) = &metadata.genre {
        tag.set_genre(genre.clone());
    }
}

fn write_mp3(path: &Path, metadata: &TrackMetadataUpdate) -> Result<(), MetadataWriteError> {
    let mut tag = Tag::read_from_path(path)
        .map_err(|e| MetadataWriteError::Tag(format!("Failed to read MP3 tags: {e}")))?;

    tag.set_title(metadata.title.clone());
    if let Some(artist) = &metadata.artist {
        tag.set_artist(artist.clone());
    }
    if let Some(album) = &metadata.album {
        tag.set_album(album.clone());
    }
    if let Some(album_artist) = &metadata.album_artist {
        tag.set_text("TPE2", album_artist);
    }
    if let Some(n) = metadata.track_number {
        tag.set_track(n as u32);
    }
    if let Some(n) = metadata.disc_number {
        tag.set_disc(n as u32);
    }
    if let Some(year) = metadata.year {
        tag.set_year(year as i32);
    }
    if let Some(genre) = &metadata.genre {
        tag.set_genre(genre.clone());
    }

    if let Some(art_path) = &metadata.art_path {
        let data = read_image_bytes(art_path)?;
        let picture = Picture {
            mime_type: mime_for_path(art_path),
            picture_type: PictureType::CoverFront,
            description: String::new(),
            data,
        };
        tag.remove_all_pictures();
        tag.add_frame(picture);
    }

    tag.write_to_path(path, id3::Version::Id3v24)
        .map_err(|e| MetadataWriteError::Tag(format!("Failed to write MP3 tags: {e}")))?;
    Ok(())
}

fn write_flac(path: &Path, metadata: &TrackMetadataUpdate) -> Result<(), MetadataWriteError> {
    let mut tag = FlacTag::read_from_path(path)
        .map_err(|e| MetadataWriteError::Tag(format!("Failed to read FLAC tags: {e}")))?;

    tag.set_vorbis("TITLE", vec![metadata.title.clone()]);
    if let Some(artist) = &metadata.artist {
        tag.set_vorbis("ARTIST", vec![artist.clone()]);
    }
    if let Some(album) = &metadata.album {
        tag.set_vorbis("ALBUM", vec![album.clone()]);
    }
    if let Some(album_artist) = &metadata.album_artist {
        tag.set_vorbis("ALBUMARTIST", vec![album_artist.clone()]);
    }
    if let Some(n) = metadata.track_number {
        tag.set_vorbis("TRACKNUMBER", vec![n.to_string()]);
    }
    if let Some(n) = metadata.disc_number {
        tag.set_vorbis("DISCNUMBER", vec![n.to_string()]);
    }
    if let Some(year) = metadata.year {
        tag.set_vorbis("DATE", vec![year.to_string()]);
    }
    if let Some(genre) = &metadata.genre {
        tag.set_vorbis("GENRE", vec![genre.clone()]);
    }

    if let Some(art_path) = &metadata.art_path {
        let data = read_image_bytes(art_path)?;
        tag.remove_picture_type(FlacPictureType::CoverFront);
        tag.add_picture(mime_for_path(art_path), FlacPictureType::CoverFront, data);
    }

    tag.save()
        .map_err(|e| MetadataWriteError::Tag(format!("Failed to write FLAC tags: {e}")))?;
    Ok(())
}

fn write_m4a(path: &Path, metadata: &TrackMetadataUpdate) -> Result<(), MetadataWriteError> {
    let mut tag = Mp4Tag::read_from_path(path)
        .map_err(|e| MetadataWriteError::Tag(format!("Failed to read M4A tags: {e}")))?;

    apply_common_mp4(&mut tag, metadata);

    if let Some(art_path) = &metadata.art_path {
        let data = read_image_bytes(art_path)?;
        tag.set_artwork(mp4_artwork_data(art_path, data));
    }

    tag.write_to_path(path)
        .map_err(|e| MetadataWriteError::Tag(format!("Failed to write M4A tags: {e}")))?;
    Ok(())
}

pub fn write_track_metadata(
    path: &Path,
    metadata: &TrackMetadataUpdate,
) -> Result<(), MetadataWriteError> {
    ensure_writable(path)?;

    match audio_extension(path).as_deref() {
        Some("mp3") => write_mp3(path, metadata),
        Some("flac") => write_flac(path, metadata),
        Some("m4a") | Some("aac") => write_m4a(path, metadata),
        Some(ext) => Err(MetadataWriteError::UnsupportedFormat(format!(
            "Metadata editing is not supported for .{ext} files."
        ))),
        None => Err(MetadataWriteError::UnsupportedFormat(
            "Unknown audio format.".to_string(),
        )),
    }
}
