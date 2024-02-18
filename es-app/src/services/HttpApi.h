#pragma once

#include <string>
#include <rapidjson/rapidjson.h>
#include <rapidjson/pointer.h>
#include <rapidjson/prettywriter.h>
#include <rapidjson/stringbuffer.h>

class SystemData;
class FileData;

class HttpApi
{
public:
	static std::string getCaps();
	static std::string getSystemList();
	static std::string getSystemGames(SystemData* system, size_t from, size_t limit, unsigned sortid);
	inline static std::string getSystemGames(SystemData* system){return getSystemGames(system,0,0,0);}
	static std::string getMusicRootInfo();
	static std::string getSplashRootInfo();
	static std::string getFilesInfo(const std::string& baseurl, const std::string& dir, const std::string& path);

	static std::string getRunnningGameInfo();

	static std::string ToJson(SystemData* system, bool localpaths = false);
	static std::string ToJson(FileData* file, bool localpaths = false);

	static FileData*   findFileData(SystemData* system, const std::string& id);

	static bool ImportFromJson(FileData* file, const std::string& json);

	static bool ImportMedia(FileData* file, const std::string& mediaType, const std::string& contentType, const std::string& mediaBytes);
	static bool RemoveMedia(FileData* file, const std::string& mediaType);

private:
	static std::string getFileDataId(FileData* game);
	static void getFileDataJson(rapidjson::PrettyWriter<rapidjson::StringBuffer>& writer, FileData* game, bool localpaths = false);
	static void getSystemDataJson(rapidjson::PrettyWriter<rapidjson::StringBuffer>& writer, SystemData* sys, bool localpaths = false);
};
